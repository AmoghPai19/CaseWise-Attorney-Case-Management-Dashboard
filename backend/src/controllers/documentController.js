const path = require('path');
const fs = require('fs');
const { body } = require('express-validator');
const multer = require('multer');
const Document = require('../models/Document');
const Case = require('../models/Case');
const { createAuditLog } = require('../utils/auditLogger');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const documentValidation = [
  body('caseId').notEmpty().withMessage('Case is required'),
];

const documentUpdateValidation = [
  body('status')
    .optional()
    .isIn(['Pending', 'Under Review', 'Reviewed'])
    .withMessage('Invalid status value'),
];

async function ensureCasePermission(req, caseId) {
  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) {
    const error = new Error('Case not found');
    error.statusCode = 404;
    throw error;
  }

  if (req.user.role === 'Attorney') {
    if (String(caseDoc.assignedAttorney) !== String(req.user._id)) {
      const error = new Error('Forbidden: not your case');
      error.statusCode = 403;
      throw error;
    }
  } else if (req.user.role === 'Assistant') {
    const isAssigned =
      Array.isArray(caseDoc.assistants) &&
      caseDoc.assistants.some((id) => String(id) === String(req.user._id));
    if (!isAssigned) {
      const error = new Error('Forbidden: not your case');
      error.statusCode = 403;
      throw error;
    }
  }
  return caseDoc;
}

async function getDocuments(req, res, next) {
  try {
    const { caseId } = req.query;
    const filter = {};
    if (caseId) filter.caseId = caseId;

    const docs = await Document.find(filter)
      .populate('caseId', 'title assignedAttorney assistants')
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 });

    const filtered = docs.filter((doc) => {
      if (req.user.role === 'Admin') {
        return true;
      }
      if (!doc.caseId) return false;

      if (req.user.role === 'Attorney') {
        return (
          doc.caseId.assignedAttorney &&
          String(doc.caseId.assignedAttorney) === String(req.user._id)
        );
      }

      if (req.user.role === 'Assistant') {
        return (
          Array.isArray(doc.caseId.assistants) &&
          doc.caseId.assistants.some(
            (id) => String(id) === String(req.user._id)
          )
        );
      }

      return false;
    });

    return res.json(filtered);
  } catch (err) {
    return next(err);
  }
}

async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    await ensureCasePermission(req, req.body.caseId);

    const fileUrl = `/uploads/${req.file.filename}`;
    const doc = await Document.create({
      caseId: req.body.caseId,
      filename: req.file.originalname,
      fileUrl,
      uploadedBy: req.user._id,
      status: 'Pending',
    });

    await createAuditLog({
      userId: req.user._id,
      action: 'document_upload',
      entity: 'Document',
      entityId: doc._id,
    });

    return res.status(201).json(doc);
  } catch (err) {
    return next(err);
  }
}

async function updateDocument(req, res, next) {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (typeof req.body.status !== 'undefined') {
      doc.status = req.body.status;
    }

    await doc.save();

    return res.json(doc);
  } catch (err) {
    next(err);
  }
}

async function deleteDocument(req, res, next) {
  try {
    const doc = await Document.findById(req.params.id).populate(
      'caseId',
      'assignedAttorney assistants'
    );
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    if (doc.caseId) {
      if (
        req.user.role === 'Attorney' &&
        doc.caseId.assignedAttorney &&
        String(doc.caseId.assignedAttorney) !== String(req.user._id)
      ) {
        return res.status(403).json({ message: 'Forbidden: not your case' });
      }

      if (req.user.role === 'Assistant') {
        const isAssigned =
          Array.isArray(doc.caseId.assistants) &&
          doc.caseId.assistants.some(
            (id) => String(id) === String(req.user._id)
          );
        if (!isAssigned) {
          return res.status(403).json({ message: 'Forbidden: not your case' });
        }
      }
    }

    const filePath = path.join(__dirname, '..', '..', doc.fileUrl);
    fs.unlink(filePath, (err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to delete file', err);
      }
    });

    await Document.deleteOne({ _id: doc._id });

    await createAuditLog({
      userId: req.user._id,
      action: 'delete',
      entity: 'Document',
      entityId: doc._id,
      metadata: {
        caseId: doc.caseId,
        filename: doc.filename
      }
    });

    return res.json({ message: 'Document deleted' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
  documentValidation,
  documentUpdateValidation,
  uploadMiddleware: upload.single('file'),
};


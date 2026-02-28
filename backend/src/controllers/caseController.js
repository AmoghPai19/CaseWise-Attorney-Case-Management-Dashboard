const { body } = require('express-validator');
const Case = require('../models/Case');
const Client = require('../models/Client');
const Task = require('../models/Task');
const Document = require('../models/Document');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');
const { buildCaseSummary } = require('../utils/caseSummary');

const caseValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('clientId').notEmpty().withMessage('Client is required'),
  body('deadline').notEmpty().isISO8601().toDate(),
  body('description').optional().isString(),
  body('status').optional().isIn(['Open', 'Pending', 'Closed']),
  body('priority').optional().isIn(['Low', 'Medium', 'High']),
  body('startDate').optional().isISO8601().toDate(),
  body('tags').optional().isArray(),
];

function buildCaseFilterForUser(user) {
  if (user.role === 'Admin') return {};
  if (user.role === 'Attorney') {
    return { assignedAttorney: user._id };
  }
  if (user.role === 'Assistant') {
    return { assistants: user._id };
  }
  return {};
}

async function getCases(req, res, next) {
  try {
    const { search, status, priority } = req.query;

    const filter = buildCaseFilterForUser(req.user);
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const cases = await Case.find(filter)
      .populate('clientId', 'name')
      .populate('assignedAttorney', 'name email')
      .sort({ createdAt: -1 });

    return res.json(cases);
  } catch (err) {
    return next(err);
  }
}

async function getCaseById(req, res, next) {
  try {
    const caseDoc = await Case.findById(req.params.id)
      .populate('clientId', 'name email')
      .populate('assignedAttorney', 'name email')
      .populate('assistants', 'name email role');
    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }

    if (req.user.role === 'Attorney') {
      if (String(caseDoc.assignedAttorney._id) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden: not your case' });
      }
    } else if (req.user.role === 'Assistant') {
      const isAssigned =
        Array.isArray(caseDoc.assistants) &&
        caseDoc.assistants.some(
          (a) => String(a._id || a) === String(req.user._id)
        );
      if (!isAssigned) {
        return res.status(403).json({ message: 'Forbidden: not your case' });
      }
    }

    const [tasks, documents] = await Promise.all([
      Task.find({ caseId: caseDoc._id }),
      Document.find({ caseId: caseDoc._id }),
    ]);

    const openTasks = tasks.filter((t) => t.status !== 'Completed');
    const client = caseDoc.clientId
      ? { name: caseDoc.clientId.name }
      : null;

    const requiredDocs = []; // could be configured per case type; placeholder empty list
    const existingDocNames = documents.map((d) => d.filename);
    const missingDocuments = requiredDocs.filter(
      (name) => !existingDocNames.includes(name)
    );

    const summary = buildCaseSummary({
      caseDoc,
      client,
      openTasks,
      missingDocuments,
    });

    return res.json({
      case: caseDoc,
      tasks,
      documents,
      summary,
    });
  } catch (err) {
    return next(err);
  }
}

async function createCase(req, res, next) {
  try {
    const client = await Client.findById(req.body.clientId);
    if (!client) {
      return res.status(400).json({ message: 'Invalid clientId' });
    }

    const payload = {
      title: req.body.title,
      description: req.body.description,
      clientId: req.body.clientId,
      assignedAttorney: req.user._id,
      status: req.body.status || 'Open',
      priority: req.body.priority || 'Medium',
      startDate: req.body.startDate || new Date(),
      deadline: req.body.deadline,
      tags: req.body.tags || [],
      createdBy: req.user._id,
    };

    const caseDoc = await Case.create(payload);

    await createAuditLog({
      userId: req.user._id,
      action: 'update', // or create/delete
      entity: 'Case',
      entityId: caseDoc._id,
      metadata: {
        title: caseDoc.title
      }
    });

    return res.status(201).json(caseDoc);
  } catch (err) {
    return next(err);
  }
}

async function updateCase(req, res, next) {
  try {
    const updates = {
      title: req.body.title,
      description: req.body.description,
      clientId: req.body.clientId,
      assignedAttorney: req.body.assignedAttorney,
      status: req.body.status,
      priority: req.body.priority,
      startDate: req.body.startDate,
      deadline: req.body.deadline,
      tags: req.body.tags,
    };

    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }

    if (
      req.user.role === 'Attorney' &&
      String(caseDoc.assignedAttorney) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Forbidden: not your case' });
    }

    Object.keys(updates).forEach((key) => {
      if (typeof updates[key] !== 'undefined') {
        caseDoc[key] = updates[key];
      }
    });

    await caseDoc.save();

    await createAuditLog({
      userId: req.user._id,
      action: 'update',
      entity: 'Case',
      entityId: caseDoc._id,
    });

    return res.json(caseDoc);
  } catch (err) {
    return next(err);
  }
}

async function deleteCase(req, res, next) {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }

    if (
      req.user.role === 'Attorney' &&
      String(caseDoc.assignedAttorney) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Forbidden: not your case' });
    }

    await Case.deleteOne({ _id: caseDoc._id });

    await createAuditLog({
      userId: req.user._id,
      action: 'delete',
      entity: 'Case',
      entityId: caseDoc._id,
    });

    return res.json({ message: 'Case deleted' });
  } catch (err) {
    return next(err);
  }
}

async function addAssistant(req, res, next) {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }

    if (
      req.user.role === 'Attorney' &&
      String(caseDoc.assignedAttorney) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Only the assigned attorney can modify assistants' });
    }

    const { assistantId } = req.body;
    if (!assistantId) {
      return res.status(400).json({ message: 'assistantId is required' });
    }

    const assistant = await User.findById(assistantId);
    if (!assistant) {
      return res.status(404).json({ message: 'Assistant user not found' });
    }
    if (assistant.role !== 'Assistant') {
      return res.status(400).json({ message: 'Only users with Assistant role can be assigned' });
    }

    const alreadyAssigned =
      Array.isArray(caseDoc.assistants) &&
      caseDoc.assistants.some((id) => String(id) === String(assistant._id));
    if (!alreadyAssigned) {
      caseDoc.assistants.push(assistant._id);
      await caseDoc.save();

      await createAuditLog({
        userId: req.user._id,
        action: 'add_assistant',
        entity: 'Case',
        entityId: caseDoc._id,
        metadata: { assistantId: assistant._id },
      });
    }

    const populated = await Case.findById(caseDoc._id)
      .populate('clientId', 'name email')
      .populate('assignedAttorney', 'name email')
      .populate('assistants', 'name email role');

    return res.json(populated);
  } catch (err) {
    return next(err);
  }
}

async function removeAssistant(req, res, next) {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }

    if (
      req.user.role === 'Attorney' &&
      String(caseDoc.assignedAttorney) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Only the assigned attorney can modify assistants' });
    }

    const { assistantId } = req.params;
    const beforeLength = (caseDoc.assistants || []).length;
    caseDoc.assistants = (caseDoc.assistants || []).filter(
      (id) => String(id) !== String(assistantId)
    );

    if (caseDoc.assistants.length === beforeLength) {
      return res.status(404).json({ message: 'Assistant not assigned to this case' });
    }

    await caseDoc.save();

    await createAuditLog({
      userId: req.user._id,
      action: 'remove_assistant',
      entity: 'Case',
      entityId: caseDoc._id,
      metadata: { assistantId },
    });

    const populated = await Case.findById(caseDoc._id)
      .populate('clientId', 'name email')
      .populate('assignedAttorney', 'name email')
      .populate('assistants', 'name email role');

    return res.json(populated);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  addAssistant,
  removeAssistant,
  caseValidation,
};


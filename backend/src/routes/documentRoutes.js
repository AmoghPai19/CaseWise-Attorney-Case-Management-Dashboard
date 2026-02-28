const express = require('express');
const {
  getDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
  uploadMiddleware,
  documentValidation,
  documentUpdateValidation,
} = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getDocuments);
router.post(
  '/upload',
  roleMiddleware('Admin', 'Attorney'),
  uploadMiddleware,
  documentValidation,
  validateRequest,
  uploadDocument
);
router.put(
  '/:id',
  roleMiddleware('Admin', 'Attorney'),
  documentUpdateValidation,
  validateRequest,
  updateDocument
);
router.delete(
  '/:id',
  roleMiddleware('Admin', 'Attorney'),
  deleteDocument
);

module.exports = router;


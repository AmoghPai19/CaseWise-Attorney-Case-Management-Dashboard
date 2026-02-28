const express = require('express');
const {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  addAssistant,
  removeAssistant,
  caseValidation,
} = require('../controllers/caseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getCases);
router.get('/:id', getCaseById);
router.post(
  '/',
  roleMiddleware('Admin', 'Attorney'),
  caseValidation,
  validateRequest,
  createCase
);
router.put(
  '/:id',
  roleMiddleware('Admin', 'Attorney'),
  caseValidation,
  validateRequest,
  updateCase
);
router.delete('/:id', roleMiddleware('Admin', 'Attorney'), deleteCase);

router.post(
  '/:id/add-assistant',
  roleMiddleware('Admin', 'Attorney'),
  addAssistant
);
router.delete(
  '/:id/remove-assistant/:assistantId',
  roleMiddleware('Admin', 'Attorney'),
  removeAssistant
);

module.exports = router;


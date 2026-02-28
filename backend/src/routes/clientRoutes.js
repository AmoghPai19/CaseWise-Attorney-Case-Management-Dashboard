const express = require('express');
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  clientValidation,
} = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getClients);
router.get('/:id', getClientById);
router.post(
  '/',
  roleMiddleware('Admin', 'Attorney'),
  clientValidation,
  validateRequest,
  createClient
);
router.put(
  '/:id',
  roleMiddleware('Admin', 'Attorney'),
  clientValidation,
  validateRequest,
  updateClient
);
router.delete('/:id', roleMiddleware('Admin', 'Attorney'), deleteClient);

module.exports = router;


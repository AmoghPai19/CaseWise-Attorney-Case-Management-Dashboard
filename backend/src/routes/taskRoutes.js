const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  taskValidation,
  taskUpdateValidation,
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post(
  '/',
  roleMiddleware('Admin', 'Attorney'),
  taskValidation,
  validateRequest,
  createTask
);
router.put(
  '/:id',
  roleMiddleware('Admin', 'Attorney'),
  taskUpdateValidation,
  validateRequest,
  updateTask
);
router.delete('/:id', roleMiddleware('Admin', 'Attorney'), deleteTask);

module.exports = router;


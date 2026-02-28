const express = require('express');
const {
  getUsers,
  getAssistants,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  updateOwnProfile,
  createUserValidation,
  updateUserValidation,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/assistants',
  roleMiddleware('Admin', 'Attorney'),
  getAssistants
);
router.put('/profile', updateOwnProfile);
router.put('/change-password', changePassword);

router.use(roleMiddleware('Admin'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUserValidation, validateRequest, createUser);
router.put('/:id', updateUserValidation, validateRequest, updateUser);
router.delete('/:id', deleteUser);

module.exports = router;


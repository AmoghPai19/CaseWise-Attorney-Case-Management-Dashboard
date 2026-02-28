const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  registerValidation,
  loginValidation,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);

module.exports = router;


const { body } = require('express-validator');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');
const generateToken = require('../utils/generateToken');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Public registration is always created as an Attorney,
    // regardless of any role field passed in the request body.
    const user = await User.create({
      name,
      email,
      password,
      role: 'Attorney',
    });

    await createAuditLog({
      userId: user._id,
      action: 'register',
      entity: 'User',
      entityId: user._id,
    });

    const token = generateToken(user);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    await createAuditLog({
      userId: user._id,
      action: 'login',
      entity: 'User',
      entityId: user._id,
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getMe(req, res) {
  return res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
}

async function logout(req, res) {
  // For JWT-based auth, logout is handled client-side by discarding the token.
  return res.json({ message: 'Logged out' });
}

module.exports = {
  register,
  login,
  getMe,
  logout,
  registerValidation,
  loginValidation,
};


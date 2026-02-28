const { body } = require('express-validator');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');

const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['Admin', 'Attorney', 'Assistant'])
    .withMessage('Invalid role'),
];

const updateUserValidation = [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['Admin', 'Attorney', 'Assistant']),
];

async function getUsers(req, res, next) {
  try {
    const users = await User.find().select('-password');
    return res.json(users);
  } catch (err) {
    return next(err);
  }
}

async function getAssistants(req, res, next) {
  try {
    const assistants = await User.find({ role: 'Assistant' }).select(
      'name email role'
    );
    return res.json(assistants);
  } catch (err) {
    return next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (err) {
    return next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const user = await User.create({ name, email, password, role });

    await createAuditLog({
      userId: req.user._id,
      action: 'create',
      entity: 'User',
      entityId: user._id,
    });

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const updates = { ...req.body };
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'update',
      entity: 'User',
      entityId: user._id,
    });

    return res.json(user);
  } catch (err) {
    return next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'delete',
      entity: 'User',
      entityId: user._id,
    });

    return res.json({ message: 'User deleted' });
  } catch (err) {
    return next(err);
  }
}
async function updateOwnProfile(req, res, next) {
  try {
    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name } },
      { new: true }
    ).select('-password');

    await createAuditLog({
      userId: req.user._id,
      action: 'update',
      entity: 'User',
      entityId: user._id,
    });

    return res.json(user);
  } catch (err) {
    return next(err);
  }
}
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = newPassword;
    await user.save();

    await createAuditLog({
      userId: req.user._id,
      action: 'update',
      entity: 'User',
      entityId: user._id,
    });

    return res.json({ message: "Password updated successfully" });

  } catch (err) {
    return next(err);
  }
}

module.exports = {
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
};


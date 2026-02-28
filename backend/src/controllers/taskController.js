const { body } = require('express-validator');
const Task = require('../models/Task');
const Case = require('../models/Case');
const { createAuditLog } = require('../utils/auditLogger');

const taskValidation = [
  body('caseId').notEmpty().withMessage('Case is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('status')
    .optional()
    .isIn(['Open', 'In Progress', 'Completed', 'Overdue']),
  body('dueDate').notEmpty().isISO8601().toDate(),
  body('assignedTo').notEmpty().withMessage('Assigned user is required'),
];
const taskUpdateValidation = [
  body('title').optional().trim().notEmpty(),
  body('status')
    .optional()
    .isIn(['Open', 'In Progress', 'Completed', 'Overdue']),
  body('dueDate').optional().isISO8601().toDate(),
  body('assignedTo').optional(),
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

async function getTasks(req, res, next) {
  try {
    const { caseId, status } = req.query;
    const filter = {};
    if (caseId) filter.caseId = caseId;
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate('caseId', 'title assignedAttorney assistants')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });

    const filtered = tasks.filter((task) => {
      if (req.user.role === 'Admin') {
        return true;
      }

      if (!task.caseId) return false;

      if (req.user.role === 'Attorney') {
        return (
          task.caseId.assignedAttorney &&
          String(task.caseId.assignedAttorney) === String(req.user._id)
        );
      }

      if (req.user.role === 'Assistant') {
        const inAssistants =
          Array.isArray(task.caseId.assistants) &&
          task.caseId.assistants.some(
            (id) => String(id) === String(req.user._id)
          );
        const isAssignee =
          task.assignedTo && String(task.assignedTo._id) === String(req.user._id);
        return inAssistants || isAssignee;
      }

      return false;
    });

    return res.json(filtered);
  } catch (err) {
    return next(err);
  }
}

async function getTaskById(req, res, next) {
  try {
    const task = await Task.findById(req.params.id)
      .populate('caseId', 'title assignedAttorney assistants')
      .populate('assignedTo', 'name email');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.caseId) {
      if (
        req.user.role === 'Attorney' &&
        task.caseId.assignedAttorney &&
        String(task.caseId.assignedAttorney) !== String(req.user._id)
      ) {
        return res.status(403).json({ message: 'Forbidden: not your case' });
      }

      if (req.user.role === 'Assistant') {
        const inAssistants =
          Array.isArray(task.caseId.assistants) &&
          task.caseId.assistants.some(
            (id) => String(id) === String(req.user._id)
          );
        const isAssignee =
          task.assignedTo && String(task.assignedTo._id) === String(req.user._id);
        if (!inAssistants && !isAssignee) {
          return res.status(403).json({ message: 'Forbidden: not your task' });
        }
      }
    }

    return res.json(task);
  } catch (err) {
    return next(err);
  }
}

async function createTask(req, res, next) {
  try {
    await ensureCasePermission(req, req.body.caseId);

    const payload = {
      caseId: req.body.caseId,
      title: req.body.title,
      status: req.body.status || 'Open',
      dueDate: req.body.dueDate,
      assignedTo: req.body.assignedTo,
    };

    const task = await Task.create(payload);

    await createAuditLog({
      userId: req.user._id,
      action: 'create',
      entity: 'Task',
      entityId: task._id,
      metadata: {
        caseId: task.caseId,
        title: task.title
      }
    });

    return res.status(201).json(task);
  } catch (err) {
    return next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await ensureCasePermission(req, task.caseId);

    const updates = {
      title: req.body.title,
      status: req.body.status,
      dueDate: req.body.dueDate,
      assignedTo: req.body.assignedTo,
    };

    Object.keys(updates).forEach((key) => {
      if (typeof updates[key] !== 'undefined') {
        task[key] = updates[key];
      }
    });

    if (task.status !== 'Completed' && task.dueDate < new Date()) {
      task.status = 'Overdue';
    }

    await task.save();

    await createAuditLog({
      userId: req.user._id,
      action: 'update',
      entity: 'Task',
      entityId: task._id,
      metadata: {
        caseId: task.caseId,
        title: task.title
      }
    });

    return res.json(task);
  } catch (err) {
    return next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await ensureCasePermission(req, task.caseId);

    await Task.deleteOne({ _id: task._id });

    await createAuditLog({
      userId: req.user._id,
      action: 'delete',
      entity: 'Task',
      entityId: task._id,
      metadata: {
        caseId: task.caseId,
        title: task.title
      }
    });

    return res.json({ message: 'Task deleted' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  taskValidation,
  taskUpdateValidation,
};


const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed', 'Overdue'],
      default: 'Open',
    },
    dueDate: { type: Date, required: true },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;


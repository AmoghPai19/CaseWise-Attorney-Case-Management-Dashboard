const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    userName: {
      type: String,
    },
    role: {
      type: String,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    entity: {
      type: String,
      required: true,
      trim: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    metadata: {
      type: Object,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
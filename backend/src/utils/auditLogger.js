const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

async function createAuditLog({
  userId,
  action,
  entity,
  entityId,
  metadata,
}) {
  try {
    let userName = null;
    let role = null;

    // ✅ Fetch user details safely (for legal-grade traceability)
    if (userId) {
      const user = await User.findById(userId).select('name role');
      if (user) {
        userName = user.name;
        role = user.role;
      }
    }

    await AuditLog.create({
      userId: userId || null,
      userName,
      role,
      action,
      entity,
      entityId,
      metadata: metadata || undefined,
      timestamp: new Date(),
    });

  } catch (err) {
    // Never break main operation because of logging
    console.error('Failed to write audit log', err);
  }
}

module.exports = { createAuditLog };
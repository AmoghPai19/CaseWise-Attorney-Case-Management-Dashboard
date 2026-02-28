const AuditLog = require('../models/AuditLog');
const Case = require('../models/Case');
const { Parser } = require('json2csv');

async function exportAuditLogs(req, res, next) {
  try {
    const { format = 'csv', from, to } = req.query;

    const filter = {};

    if (from || to) {
      filter.timestamp = {};

      if (from) {
        const startDate = new Date(from);
        startDate.setHours(0, 0, 0, 0);
        filter.timestamp.$gte = startDate;
      }

      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = endDate;
      }
    }
    let logs;

    // 🔐 ADMIN → full system logs
    if (req.user.role === 'Admin') {
      logs = await AuditLog.find(filter)
        .populate('userId', 'name role')
        .sort({ timestamp: -1 })
        .lean();
    }

    // 🔐 ATTORNEY → only logs tied to their cases
    else if (req.user.role === 'Attorney') {

      const attorneyCases = await Case.find({
        assignedAttorney: req.user._id
      }).select('_id');

      const caseIds = attorneyCases.map(c => c._id);

      logs = await AuditLog.find({
        ...filter,
        $or: [
          { entity: 'Case', entityId: { $in: caseIds } },
          { entity: 'Document', 'metadata.caseId': { $in: caseIds } },
          { entity: 'Task', 'metadata.caseId': { $in: caseIds } }
        ]
      })
        .populate('userId', 'name role')
        .sort({ timestamp: -1 })
        .lean();
    }

    else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // 🔥 Transform clean export format
    const cleaned = logs.map(log => ({
      timestamp: log.timestamp,
      userName: log.userId?.name || 'System',
      role: log.userId?.role || '-',
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      caseId: log.metadata?.caseId || null,
      details: log.metadata || {}
    }));

    // JSON export (pretty)
    if (format === 'json') {
      return res.send(
        JSON.stringify(
          {
            exportedAt: new Date(),
            totalRecords: cleaned.length,
            data: cleaned,
          },
          null,
          2
        )
      );
    }

    // CSV export
    const parser = new Parser();
    const csv = parser.parse(cleaned);

    res.header('Content-Type', 'text/csv');
    res.attachment(`audit_logs_${Date.now()}.csv`);
    return res.send(csv);

  } catch (err) {
    next(err);
  }
}

module.exports = { exportAuditLogs };
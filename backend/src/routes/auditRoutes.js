const express = require('express');
const { exportAuditLogs } = require('../controllers/auditController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Only Attorneys & Admin can export compliance logs
router.get(
  '/export',
  roleMiddleware('Attorney', 'Admin'),
  exportAuditLogs
);

module.exports = router;
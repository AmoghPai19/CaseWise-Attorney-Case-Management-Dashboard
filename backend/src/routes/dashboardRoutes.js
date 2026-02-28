const express = require('express');
const {
  getOverviewStats,
  getAttentionItems,
} = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/overview', getOverviewStats);
router.get('/attention', getAttentionItems);

module.exports = router;


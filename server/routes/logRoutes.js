const express = require('express');
const router = express.Router();
const { getLogs, createLog, clearLogs } = require('../controllers/logController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'superadmin'), getLogs);
router.post('/', protect, authorize('admin', 'superadmin'), createLog);
router.delete('/clear', protect, authorize('superadmin'), clearLogs);

module.exports = router;

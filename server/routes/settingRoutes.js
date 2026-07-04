const express = require('express');
const router = express.Router();
const {
  getSettings,
  getSetting,
  updateSetting,
  updateSettings,
} = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getSettings);
router.get('/:key', getSetting);
router.put('/:key', protect, authorize('admin', 'superadmin'), updateSetting);
router.put('/', protect, authorize('admin', 'superadmin'), updateSettings);

module.exports = router;

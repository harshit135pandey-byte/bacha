const express = require('express');
const router = express.Router();
const {
  getMessages,
  getMessage,
  createMessage,
  markReplied,
  archiveMessage,
  deleteMessage,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'superadmin'), getMessages);
router.get('/:id', protect, authorize('admin', 'superadmin'), getMessage);
router.post('/', createMessage);
router.patch('/:id/replied', protect, authorize('admin', 'superadmin'), markReplied);
router.patch('/:id/archive', protect, authorize('admin', 'superadmin'), archiveMessage);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteMessage);

module.exports = router;

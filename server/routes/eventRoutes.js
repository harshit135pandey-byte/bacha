const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', protect, authorize('admin', 'superadmin'), uploadImage.single('image'), createEvent);
router.put('/:id', protect, authorize('admin', 'superadmin'), uploadImage.single('image'), updateEvent);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteEvent);

module.exports = router;

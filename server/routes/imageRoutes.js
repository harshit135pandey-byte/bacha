const express = require('express');
const router = express.Router();
const {
  getImages,
  getImage,
  createImage,
  updateImage,
  deleteImage,
  bulkDeleteImages,
} = require('../controllers/imageController');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.get('/', getImages);
router.get('/:id', getImage);
router.post('/', protect, authorize('admin', 'superadmin', 'moderator'), uploadImage.single('image'), createImage);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateImage);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteImage);
router.post('/bulk-delete', protect, authorize('admin', 'superadmin'), bulkDeleteImages);

module.exports = router;

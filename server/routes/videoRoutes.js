const express = require('express');
const router = express.Router();
const {
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  getFeaturedVideos,
  getRelatedVideos,
  toggleFeatured,
  bulkDelete,
} = require('../controllers/videoController');
const { protect, authorize } = require('../middleware/auth');
const { uploadVideo } = require('../middleware/upload');

router.get('/', getVideos);
router.get('/featured', getFeaturedVideos);
router.get('/:id', getVideo);
router.get('/:id/related', getRelatedVideos);

router.post('/', protect, authorize('admin', 'superadmin', 'moderator'), uploadVideo.single('video'), createVideo);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateVideo);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteVideo);
router.patch('/:id/featured', protect, authorize('admin', 'superadmin'), toggleFeatured);
router.post('/bulk-delete', protect, authorize('admin', 'superadmin'), bulkDelete);

module.exports = router;

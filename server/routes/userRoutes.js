const express = require('express');
const router = express.Router();
const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  suspendUser,
  activateUser,
  updateProfile,
  getDashboardStats,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

router.get('/stats', protect, authorize('admin', 'superadmin'), getDashboardStats);
router.post('/', protect, authorize('admin', 'superadmin'), createUser);
router.get('/', protect, authorize('admin', 'superadmin'), getUsers);
router.get('/:id', protect, authorize('admin', 'superadmin'), getUser);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateUser);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteUser);
router.patch('/:id/suspend', protect, authorize('admin', 'superadmin'), suspendUser);
router.patch('/:id/activate', protect, authorize('admin', 'superadmin'), activateUser);
router.put('/profile/update', protect, uploadProfile.single('profilePhoto'), updateProfile);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', protect, authorize('admin', 'superadmin'), createCategory);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateCategory);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteCategory);
router.put('/reorder', protect, authorize('admin', 'superadmin'), reorderCategories);

module.exports = router;

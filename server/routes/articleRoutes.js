const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticle,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} = require('../controllers/articleController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getArticles);
router.get('/slug/:slug', getArticleBySlug);
router.get('/:id', getArticle);
router.post('/', protect, authorize('admin', 'superadmin', 'moderator'), createArticle);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateArticle);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteArticle);

module.exports = router;

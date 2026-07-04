const express = require('express');
const router = express.Router();
const {
  getQuotes,
  getDailyQuote,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
} = require('../controllers/quoteController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getQuotes);
router.get('/daily', getDailyQuote);
router.get('/:id', getQuote);
router.post('/', protect, authorize('admin', 'superadmin'), createQuote);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateQuote);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteQuote);

module.exports = router;

const Quote = require('../models/Quote');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getQuotes = asyncHandler(async (req, res) => {
  const { isActive, isDaily } = req.query;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (isDaily !== undefined) filter.isDaily = isDaily === 'true';
  const quotes = await Quote.find(filter).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, quotes, 'Quotes retrieved'));
});

const getDailyQuote = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let quote = await Quote.findOne({
    isActive: true,
    scheduledDate: { $lte: today },
  }).sort({ scheduledDate: -1 });
  if (!quote) {
    const count = await Quote.countDocuments({ isActive: true });
    if (count === 0) {
      return res.status(200).json(new ApiResponse(200, null, 'No quotes available'));
    }
    const random = Math.floor(Math.random() * count);
    quote = await Quote.findOne({ isActive: true }).skip(random);
  }
  res.status(200).json(new ApiResponse(200, quote, 'Daily quote'));
});

const getQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) {
    return res.status(404).json(new ApiResponse(404, null, 'Quote not found'));
  }
  res.status(200).json(new ApiResponse(200, quote, 'Quote retrieved'));
});

const createQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.create(req.body);
  res.status(201).json(new ApiResponse(201, quote, 'Quote created'));
});

const updateQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!quote) {
    return res.status(404).json(new ApiResponse(404, null, 'Quote not found'));
  }
  res.status(200).json(new ApiResponse(200, quote, 'Quote updated'));
});

const deleteQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findByIdAndDelete(req.params.id);
  if (!quote) {
    return res.status(404).json(new ApiResponse(404, null, 'Quote not found'));
  }
  res.status(200).json(new ApiResponse(200, null, 'Quote deleted'));
});

module.exports = {
  getQuotes,
  getDailyQuote,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
};

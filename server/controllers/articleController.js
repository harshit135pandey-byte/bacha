const Article = require('../models/Article');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getArticles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, section, category, search, sort, isFeatured, isPublished } = req.query;
  const query = {};
  if (section) query.section = section;
  if (category) query.category = category;
  if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
  if (isPublished !== undefined) query.isPublished = isPublished === 'true';
  if (search) {
    query.$text = { $search: search };
  }
  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };
  if (sort === 'popular') sortOption = { views: -1 };
  const total = await Article.countDocuments(query);
  const articles = await Article.find(query)
    .populate('category', 'name slug')
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.status(200).json({
    success: true,
    message: 'Articles retrieved',
    data: articles,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
});

const getArticle = asyncHandler(async (req, res) => {
  const article = await Article.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('category', 'name slug');
  if (!article) {
    return res.status(404).json(new ApiResponse(404, null, 'Article not found'));
  }
  res.status(200).json(new ApiResponse(200, article, 'Article retrieved'));
});

const getArticleBySlug = asyncHandler(async (req, res) => {
  const article = await Article.findOneAndUpdate(
    { slug: req.params.slug },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('category', 'name slug');
  if (!article) {
    return res.status(404).json(new ApiResponse(404, null, 'Article not found'));
  }
  res.status(200).json(new ApiResponse(200, article, 'Article retrieved'));
});

const createArticle = asyncHandler(async (req, res) => {
  const article = await Article.create(req.body);
  res.status(201).json(new ApiResponse(201, article, 'Article created'));
});

const updateArticle = asyncHandler(async (req, res) => {
  const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!article) {
    return res.status(404).json(new ApiResponse(404, null, 'Article not found'));
  }
  res.status(200).json(new ApiResponse(200, article, 'Article updated'));
});

const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findByIdAndDelete(req.params.id);
  if (!article) {
    return res.status(404).json(new ApiResponse(404, null, 'Article not found'));
  }
  res.status(200).json(new ApiResponse(200, null, 'Article deleted'));
});

module.exports = {
  getArticles,
  getArticle,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
};

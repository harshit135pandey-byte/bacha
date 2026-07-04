const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getCategories = asyncHandler(async (req, res) => {
  const { type, isActive } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  const categories = await Category.find(filter).sort({ order: 1, name: 1 });
  res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved'));
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json(new ApiResponse(404, null, 'Category not found'));
  }
  res.status(200).json(new ApiResponse(200, category, 'Category retrieved'));
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(new ApiResponse(201, category, 'Category created'));
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    return res.status(404).json(new ApiResponse(404, null, 'Category not found'));
  }
  res.status(200).json(new ApiResponse(200, category, 'Category updated'));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json(new ApiResponse(404, null, 'Category not found'));
  }
  res.status(200).json(new ApiResponse(200, null, 'Category deleted'));
});

const reorderCategories = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json(new ApiResponse(400, null, 'Items must be an array'));
  }
  for (const item of items) {
    await Category.findByIdAndUpdate(item.id, { order: item.order });
  }
  res.status(200).json(new ApiResponse(200, null, 'Categories reordered'));
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
};

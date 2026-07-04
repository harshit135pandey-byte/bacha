const Image = require('../models/Image');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { cloudinary } = require('../config/cloudinary');

const getImages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, section, category, isPublished } = req.query;
  const query = {};
  if (section) query.section = section;
  if (category) query.category = category;
  if (isPublished !== undefined) query.isPublished = isPublished === 'true';
  const total = await Image.countDocuments(query);
  const images = await Image.find(query)
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.status(200).json({
    success: true,
    message: 'Images retrieved',
    data: images,
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

const getImage = asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id).populate('category', 'name');
  if (!image) {
    return res.status(404).json(new ApiResponse(404, null, 'Image not found'));
  }
  res.status(200).json(new ApiResponse(200, image, 'Image retrieved'));
});

const createImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(new ApiResponse(400, null, 'No image file provided'));
  }
  const image = await Image.create({
    url: req.file.path,
    publicId: req.file.filename,
    title: req.body.title || '',
    section: req.body.section || 'general',
    category: req.body.category || null,
    altText: req.body.altText || '',
    width: req.file.width,
    height: req.file.height,
    fileSize: req.file.size,
    format: req.file.format,
    uploadedBy: req.user._id,
  });
  res.status(201).json(new ApiResponse(201, image, 'Image uploaded'));
});

const updateImage = asyncHandler(async (req, res) => {
  const { title, category, altText, section } = req.body;
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (category !== undefined) updateData.category = category;
  if (altText !== undefined) updateData.altText = altText;
  if (section !== undefined) updateData.section = section;
  const image = await Image.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
  if (!image) {
    return res.status(404).json(new ApiResponse(404, null, 'Image not found'));
  }
  res.status(200).json(new ApiResponse(200, image, 'Image updated'));
});

const deleteImage = asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id);
  if (!image) {
    return res.status(404).json(new ApiResponse(404, null, 'Image not found'));
  }
  if (image.publicId) {
    await cloudinary.uploader.destroy(image.publicId);
  }
  await Image.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Image deleted'));
});

const bulkDeleteImages = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json(new ApiResponse(400, null, 'No image IDs provided'));
  }
  const images = await Image.find({ _id: { $in: ids } });
  for (const image of images) {
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }
  }
  await Image.deleteMany({ _id: { $in: ids } });
  res.status(200).json(new ApiResponse(200, null, `${images.length} images deleted`));
});

module.exports = {
  getImages,
  getImage,
  createImage,
  updateImage,
  deleteImage,
  bulkDeleteImages,
};

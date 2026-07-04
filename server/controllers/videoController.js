const Video = require('../models/Video');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { cloudinary } = require('../config/cloudinary');

const getVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    section,
    search,
    sort = 'newest',
    isFeatured,
    isPublished,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (section) {
    filter.section = section;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  if (isFeatured !== undefined) {
    filter.isFeatured = isFeatured === 'true';
  }

  if (isPublished !== undefined) {
    filter.isPublished = isPublished === 'true';
  }

  let sortOption = {};
  switch (sort) {
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'popular':
      sortOption = { views: -1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  const [videos, total] = await Promise.all([
    Video.find(filter).sort(sortOption).skip(skip).limit(limitNum),
    Video.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    message: 'Videos fetched successfully',
    data: videos,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  });
});

const getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('category');

  if (!video) {
    return res.status(404).json(new ApiResponse(404, null, 'Video not found'));
  }

  res.status(200).json(new ApiResponse(200, video, 'Video fetched successfully'));
});

const createVideo = asyncHandler(async (req, res) => {
  const { title, description, category, section, tags, duration, isFeatured, thumbnail } = req.body;

  if (!req.file) {
    return res.status(400).json(new ApiResponse(400, null, 'Video file is required'));
  }

  const videoData = {
    title,
    description,
    category,
    section: section || 'general',
    tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
    duration,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    url: req.file.path,
    publicId: req.file.filename,
    thumbnail: thumbnail || `${req.file.path.split('upload/')[0]}upload/w_400,q_auto/${req.file.filename}.jpg`,
  };

  const video = await Video.create(videoData);

  res.status(201).json(new ApiResponse(201, video, 'Video created successfully'));
});

const updateVideo = asyncHandler(async (req, res) => {
  const allowedFields = [
    'title',
    'description',
    'category',
    'section',
    'tags',
    'isPublished',
    'duration',
    'thumbnail',
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === 'tags' && typeof req.body[field] === 'string') {
        updates[field] = JSON.parse(req.body[field]);
      } else {
        updates[field] = req.body[field];
      }
    }
  }

  const video = await Video.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!video) {
    return res.status(404).json(new ApiResponse(404, null, 'Video not found'));
  }

  res.status(200).json(new ApiResponse(200, video, 'Video updated successfully'));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json(new ApiResponse(404, null, 'Video not found'));
  }

  if (video.publicId) {
    await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
  }

  await Video.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(200, null, 'Video deleted successfully'));
});

const getFeaturedVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ isFeatured: true, isPublished: true })
    .sort({ createdAt: -1 })
    .limit(8);

  res.status(200).json(new ApiResponse(200, videos, 'Featured videos fetched successfully'));
});

const getRelatedVideos = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).select('category');

  if (!video) {
    return res.status(404).json(new ApiResponse(404, null, 'Video not found'));
  }

  const relatedVideos = await Video.find({
    _id: { $ne: req.params.id },
    category: video.category,
    isPublished: true,
  })
    .sort({ views: -1 })
    .limit(6);

  res.status(200).json(new ApiResponse(200, relatedVideos, 'Related videos fetched successfully'));
});

const toggleFeatured = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json(new ApiResponse(404, null, 'Video not found'));
  }

  video.isFeatured = !video.isFeatured;
  await video.save();

  res.status(200).json(
    new ApiResponse(200, video, `Video ${video.isFeatured ? 'featured' : 'unfeatured'} successfully`)
  );
});

const bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json(new ApiResponse(400, null, 'Valid array of IDs is required'));
  }

  const videos = await Video.find({ _id: { $in: ids } });

  const deleteFromCloudinary = videos
    .filter((v) => v.publicId)
    .map((v) => cloudinary.uploader.destroy(v.publicId, { resource_type: 'video' }));

  await Promise.all(deleteFromCloudinary);

  await Video.deleteMany({ _id: { $in: ids } });

  res.status(200).json(new ApiResponse(200, null, `${videos.length} video(s) deleted successfully`));
});

module.exports = {
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  getFeaturedVideos,
  getRelatedVideos,
  toggleFeatured,
  bulkDelete,
};

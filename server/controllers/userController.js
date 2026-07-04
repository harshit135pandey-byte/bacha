const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json(new ApiResponse(400, null, 'User already exists with this email'));
  }
  const user = await User.create({ name, email, password, role: role || 'user' });
  res.status(201).json(new ApiResponse(201, user, 'User created'));
});

const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, isActive, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.status(200).json({
    success: true,
    message: 'Users retrieved',
    data: users,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
  });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  }
  res.status(200).json(new ApiResponse(200, user, 'User retrieved'));
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, email, phone, role, isActive } = req.body;
  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (role) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;
  const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  }
  res.status(200).json(new ApiResponse(200, user, 'User updated'));
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  }
  res.status(200).json(new ApiResponse(200, null, 'User deleted'));
});

const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  }
  res.status(200).json(new ApiResponse(200, user, 'User suspended'));
});

const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  }
  res.status(200).json(new ApiResponse(200, user, 'User activated'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const updateData = {};
  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (req.file) {
    updateData.profilePhoto = req.file.path;
    updateData.profilePhotoPublicId = req.file.filename;
  }
  const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
  res.status(200).json(new ApiResponse(200, user, 'Profile updated'));
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const totalVideos = await require('../models/Video').countDocuments();
  const totalPhotos = await require('../models/Image').countDocuments();
  const totalCategories = await require('../models/Category').countDocuments();
  const totalMessages = await require('../models/Contact').countDocuments();
  const unreadMessages = await require('../models/Contact').countDocuments({ isRead: false });
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
  res.status(200).json(new ApiResponse(200, {
    totalUsers, activeUsers, totalVideos, totalPhotos,
    totalCategories, totalMessages, unreadMessages, recentUsers,
  }, 'Dashboard stats'));
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  suspendUser,
  activateUser,
  updateProfile,
  getDashboardStats,
};

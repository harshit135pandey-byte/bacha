const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isRead, isReplied, isArchived } = req.query;
  const query = {};
  if (isRead !== undefined) query.isRead = isRead === 'true';
  if (isReplied !== undefined) query.isReplied = isReplied === 'true';
  if (isArchived !== undefined) query.isArchived = isArchived === 'true';
  const total = await Contact.countDocuments(query);
  const messages = await Contact.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.status(200).json({
    success: true,
    message: 'Messages retrieved',
    data: messages,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
  });
});

const getMessage = asyncHandler(async (req, res) => {
  const message = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!message) {
    return res.status(404).json(new ApiResponse(404, null, 'Message not found'));
  }
  res.status(200).json(new ApiResponse(200, message, 'Message retrieved'));
});

const createMessage = asyncHandler(async (req, res) => {
  const message = await Contact.create(req.body);
  res.status(201).json(new ApiResponse(201, message, 'Message sent'));
});

const markReplied = asyncHandler(async (req, res) => {
  const message = await Contact.findByIdAndUpdate(req.params.id, { isReplied: true }, { new: true });
  if (!message) {
    return res.status(404).json(new ApiResponse(404, null, 'Message not found'));
  }
  res.status(200).json(new ApiResponse(200, message, 'Message marked as replied'));
});

const archiveMessage = asyncHandler(async (req, res) => {
  const message = await Contact.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
  if (!message) {
    return res.status(404).json(new ApiResponse(404, null, 'Message not found'));
  }
  res.status(200).json(new ApiResponse(200, message, 'Message archived'));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Contact.findByIdAndDelete(req.params.id);
  if (!message) {
    return res.status(404).json(new ApiResponse(404, null, 'Message not found'));
  }
  res.status(200).json(new ApiResponse(200, null, 'Message deleted'));
});

module.exports = {
  getMessages,
  getMessage,
  createMessage,
  markReplied,
  archiveMessage,
  deleteMessage,
};

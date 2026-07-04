const Event = require('../models/Event');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, type, isPublished } = req.query;
  const query = {};
  if (type) query.type = type;
  if (isPublished !== undefined) query.isPublished = isPublished === 'true';
  const now = new Date();
  const total = await Event.countDocuments(query);
  const events = await Event.find(query)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const upcoming = await Event.find({ date: { $gte: now }, isPublished: true })
    .sort({ date: 1 })
    .limit(6);
  res.status(200).json({
    success: true,
    message: 'Events retrieved',
    data: { events, upcoming },
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

const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json(new ApiResponse(404, null, 'Event not found'));
  }
  res.status(200).json(new ApiResponse(200, event, 'Event retrieved'));
});

const createEvent = asyncHandler(async (req, res) => {
  const eventData = { ...req.body };
  if (req.file) {
    eventData.image = req.file.path;
    eventData.imagePublicId = req.file.filename;
  }
  const event = await Event.create(eventData);
  res.status(201).json(new ApiResponse(201, event, 'Event created'));
});

const updateEvent = asyncHandler(async (req, res) => {
  const eventData = { ...req.body };
  if (req.file) {
    eventData.image = req.file.path;
    eventData.imagePublicId = req.file.filename;
  }
  const event = await Event.findByIdAndUpdate(req.params.id, eventData, {
    new: true,
    runValidators: true,
  });
  if (!event) {
    return res.status(404).json(new ApiResponse(404, null, 'Event not found'));
  }
  res.status(200).json(new ApiResponse(200, event, 'Event updated'));
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    return res.status(404).json(new ApiResponse(404, null, 'Event not found'));
  }
  res.status(200).json(new ApiResponse(200, null, 'Event deleted'));
});

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};

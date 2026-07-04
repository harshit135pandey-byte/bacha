const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, action, resource, userId, status } = req.query;
  const query = {};
  if (action) query.action = action;
  if (resource) query.resource = resource;
  if (userId) query.user = userId;
  if (status) query.status = status;
  const total = await AuditLog.countDocuments(query);
  const logs = await AuditLog.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.status(200).json({
    success: true,
    message: 'Logs retrieved',
    data: logs,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
  });
});

const createLog = asyncHandler(async (req, res) => {
  const log = await AuditLog.create({
    user: req.user?._id,
    action: req.body.action,
    resource: req.body.resource,
    resourceId: req.body.resourceId,
    details: req.body.details,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    status: req.body.status || 'success',
  });
  res.status(201).json(new ApiResponse(201, log, 'Log created'));
});

const clearLogs = asyncHandler(async (req, res) => {
  await AuditLog.deleteMany({});
  res.status(200).json(new ApiResponse(200, null, 'Logs cleared'));
});

module.exports = {
  getLogs,
  createLog,
  clearLogs,
};

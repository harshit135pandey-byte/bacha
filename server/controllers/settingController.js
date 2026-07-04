const Setting = require('../models/Setting');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.find();
  const result = {};
  settings.forEach((s) => {
    result[s.key] = s.value;
  });
  res.status(200).json(new ApiResponse(200, result, 'Settings retrieved'));
});

const getSetting = asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ key: req.params.key });
  if (!setting) {
    return res.status(404).json(new ApiResponse(404, null, 'Setting not found'));
  }
  res.status(200).json(new ApiResponse(200, { [setting.key]: setting.value }, 'Setting retrieved'));
});

const updateSetting = asyncHandler(async (req, res) => {
  const { value } = req.body;
  const setting = await Setting.findOneAndUpdate(
    { key: req.params.key },
    { value },
    { new: true, upsert: true }
  );
  res.status(200).json(new ApiResponse(200, { [setting.key]: setting.value }, 'Setting updated'));
});

const updateSettings = asyncHandler(async (req, res) => {
  const updates = req.body;
  const keys = Object.keys(updates);
  for (const key of keys) {
    await Setting.findOneAndUpdate(
      { key },
      { value: updates[key] },
      { new: true, upsert: true }
    );
  }
  const settings = await Setting.find();
  const result = {};
  settings.forEach((s) => {
    result[s.key] = s.value;
  });
  res.status(200).json(new ApiResponse(200, result, 'Settings updated'));
});

module.exports = {
  getSettings,
  getSetting,
  updateSetting,
  updateSettings,
};

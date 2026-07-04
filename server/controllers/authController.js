const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const sendEmail = require('../utils/sendEmail');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} = require('../utils/generateToken');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json(new ApiResponse(400, null, 'User already exists with this email'));
  }

  const user = await User.create({ name, email, password, role });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(201).json(
    new ApiResponse(201, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
    }, 'User registered successfully')
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(new ApiResponse(400, null, 'Please provide email and password'));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json(new ApiResponse(401, null, 'Invalid email or password'));
  }

  if (!user.isActive) {
    return res.status(401).json(new ApiResponse(401, null, 'Account has been deactivated. Contact support'));
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res.status(401).json(new ApiResponse(401, null, 'Invalid email or password'));
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(200).json(
    new ApiResponse(200, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
    }, 'Login successful')
  );
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }
  }

  clearTokenCookies(res);

  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken;
  if (!incomingToken) {
    return res.status(401).json(new ApiResponse(401, null, 'Refresh token not found'));
  }

  const decoded = verifyRefreshToken(incomingToken);
  if (!decoded) {
    return res.status(401).json(new ApiResponse(401, null, 'Invalid or expired refresh token'));
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== incomingToken) {
    return res.status(401).json(new ApiResponse(401, null, 'Refresh token is invalid or has been revoked'));
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, newAccessToken, newRefreshToken);

  res.status(200).json(
    new ApiResponse(200, {
      accessToken: newAccessToken,
    }, 'Token refreshed successfully')
  );
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  }

  res.status(200).json(new ApiResponse(200, user, 'User profile retrieved'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json(new ApiResponse(400, null, 'Please provide an email address'));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, 'No account found with that email'));
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

  const message = `
    <h1>Password Reset Request</h1>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
    <p>This link will expire in 10 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      html: message,
    });

    res.status(200).json(new ApiResponse(200, null, 'Password reset email sent'));
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json(new ApiResponse(500, null, 'Failed to send password reset email'));
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json(new ApiResponse(400, null, 'Please provide a new password'));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json(new ApiResponse(400, null, 'Reset token is invalid or has expired'));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = null;
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(200).json(
    new ApiResponse(200, {
      accessToken,
    }, 'Password reset successful')
  );
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json(new ApiResponse(400, null, 'Please provide current password and new password'));
  }

  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  }

  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    return res.status(401).json(new ApiResponse(401, null, 'Current password is incorrect'));
  }

  user.password = newPassword;
  user.refreshToken = null;
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(200).json(
    new ApiResponse(200, {
      accessToken,
    }, 'Password updated successfully')
  );
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
};

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../validators/validate');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/authValidator');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.put('/reset-password/:token', resetPasswordValidator, validate, resetPassword);
router.put('/update-password', protect, updatePassword);

module.exports = router;

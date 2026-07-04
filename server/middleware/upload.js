const multer = require('multer');
const path = require('path');
const { cloudinary } = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mera-bacha-meri-shan/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
    max_file_size: 100 * 1024 * 1024,
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mera-bacha-meri-shan/images',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    max_file_size: 10 * 1024 * 1024,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mera-bacha-meri-shan/profiles',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    max_file_size: 5 * 1024 * 1024,
    transformation: [{ width: 300, height: 300, crop: 'fill', quality: 'auto' }],
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Allowed: mp4, webm, mov, avi, mkv'), false);
    }
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Allowed: jpg, png, gif, webp, svg'), false);
    }
  },
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Allowed: jpg, png'), false);
    }
  },
});

module.exports = { uploadVideo, uploadImage, uploadProfile };

const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: '',
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      enum: ['community', 'parent', 'student', 'general', 'gallery'],
      default: 'general',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    altText: {
      type: String,
      default: '',
    },
    width: Number,
    height: Number,
    fileSize: Number,
    format: String,
    isPublished: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Image', imageSchema);

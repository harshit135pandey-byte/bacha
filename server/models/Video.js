const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    url: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    publicId: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    thumbnailPublicId: {
      type: String,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    section: {
      type: String,
      enum: ['student', 'parent', 'community', 'general'],
      default: 'student',
    },
    duration: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    tags: [String],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ category: 1, createdAt: -1 });
videoSchema.index({ section: 1, isPublished: 1 });
videoSchema.index({ isFeatured: 1, createdAt: -1 });

module.exports = mongoose.model('Video', videoSchema);

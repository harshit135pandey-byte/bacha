const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Quote content is required'],
      maxlength: [500, 'Quote cannot exceed 500 characters'],
    },
    author: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    isDaily: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Quote', quoteSchema);

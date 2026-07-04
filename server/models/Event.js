const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: String,
    location: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['workshop', 'community', 'volunteer', 'campaign', 'seminar'],
      default: 'community',
    },
    image: {
      type: String,
      default: '',
    },
    imagePublicId: {
      type: String,
      default: '',
    },
    registrationLink: String,
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);

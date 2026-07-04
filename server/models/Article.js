const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
    },
    excerpt: {
      type: String,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    section: {
      type: String,
      enum: ['parent', 'community', 'student', 'general'],
      default: 'parent',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    coverImage: {
      type: String,
      default: '',
    },
    coverImagePublicId: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      default: 'Mera Bacha Meri Shan',
    },
    tags: [String],
    isPublished: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

articleSchema.pre('save', function (next) {
  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  next();
});

articleSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Article', articleSchema);

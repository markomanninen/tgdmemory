const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  pageUrl: { // URL of the page being commented on
    type: String,
    required: true,
    index: true,
  },
  selectedText: { // The specific text snippet that was highlighted/selected
    type: String,
    default: null, // Null if the comment is for the whole page
  },
  selectionDetails: { // Store selection info: e.g., start/end offsets, range, surrounding context
    type: Object,
    default: null,
  },
  commentText: {
    type: String,
    required: true,
  },
  authorDisplayName: { // Display name for the author, can be username or 'Anonymous'
    type: String,
    default: 'Anonymous',
  },
  userId: { // Link to the User model (if a user is logged in)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // You will need to create a User model later
    default: null,
    index: true,
  },
  userGroup: { // For user group functionality (e.g., 'public', 'editors', 'group_project_alpha')
    type: String,
    default: 'public', // Default group
    index: true,
  },
  status: { // For admin review and comment lifecycle
    type: String,
    enum: ['pending_approval', 'approved', 'rejected', 'flagged_for_review', 'archived'],
    default: 'approved', // Default to 'approved'; change to 'pending_approval' for mandatory moderation
    index: true,
  },
  isPrivate: { // True if the comment is a private note for the user (requires userId)
    type: Boolean,
    default: false,
  },
  tags: [{ // For categorizing or tagging comments
    type: String,
    trim: true,
  }],
  parentId: { // For threaded comments/replies
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  // Consider adding a field for reaction counts if needed later
  // reactions: { like: Number, love: Number, ... }
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update `updatedAt` timestamp automatically before saving
commentSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

// Compound index for efficiently fetching comments for a page, considering visibility
commentSchema.index({ pageUrl: 1, status: 1, userGroup: 1, isPrivate: 1, createdAt: -1 });
// Index for fetching a user's comments (both public and private)
commentSchema.index({ userId: 1, pageUrl: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);

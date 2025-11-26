// models/Run.js
const mongoose = require('mongoose');

const runSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    levelId: {
      type: Number,
      required: true,
    },
    timeMs: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// one best time per user per level
runSchema.index({ user: 1, levelId: 1 }, { unique: true });

module.exports = mongoose.model('Run', runSchema);

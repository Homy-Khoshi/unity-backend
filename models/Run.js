// models/Run.js
const mongoose = require('mongoose');

const runSchema = new mongoose.Schema(
  {
    username: {
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
// use the actual field name `levelId` and guard against model overwrite
runSchema.index({ username: 1, levelId: 1 }, { unique: true });

module.exports = mongoose.models.Run || mongoose.model('Run', runSchema);

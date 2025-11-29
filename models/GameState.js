// models/GameState.js
const mongoose = require('mongoose');

const gameStateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one game state per user
    },
    levelId: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.GameState || mongoose.model('GameState', gameStateSchema);

const mongoose = require('mongoose');

const gameStateSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true       // ONE game state per player
  },

  lastScene: {
    type: String,
    default: "1"       // starting scene
  },

  level: {
    type: Number,
    default: 1
  },

  coins: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("GameState", gameStateSchema);

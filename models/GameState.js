const mongoose = require('mongoose');

const gameStateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  enemiesDefeated: { type: Number, default: 0 },
  matchesPlayed: { type: Number, default: 0 },
  matchesWon: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('GameState', gameStateSchema);

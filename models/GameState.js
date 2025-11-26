const mongoose = require('mongoose');

const runSchema = new mongoose.Schema({
  username: { type: String, required: true },
  level: { type: Number, required: true },
  timeSec: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Run', runSchema);

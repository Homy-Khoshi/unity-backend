const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true } // store hash, not raw password
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

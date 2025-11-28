const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const GameState = require('../models/GameState');

const router = express.Router();

function isStrongPassword(pw) {
  if (typeof pw !== 'string') {
    return false; // or throw, but false is fine for validation
  }

  const lengthOK = pw.length >= 10;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const digit = /[0-9]/.test(pw);
  const symbol = /[^A-Za-z0-9]/.test(pw);

  return lengthOK && upper && lower && digit && symbol;
}
router.post('/signup', async (req, res) => {
  try {
    // ✅ Safe destructuring
    const { username, password } = req.body || {};

    // ✅ Validate presence first
    if (!username || !password) {
      console.log('Signup missing fields. Body =', req.body);
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // ✅ Then strong password check
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 10 chars and include uppercase, lowercase, number, and symbol.'
      });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'Username already taken.' });
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      passwordHash: hash
    });

    await GameState.create({ user: user._id });

    req.session.userId = user._id.toString();

    res.status(201).json({ message: 'Signup successful', username: user.username });
  } catch (err) {
    console.error('Error in /signup:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};


    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    // Successful auth – create session
    req.session.userId = user._id.toString();
    req.session.username = user.username;

    res.json({ message: 'Login successful', username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid'); // default cookie name
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;

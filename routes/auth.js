// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
//const GameState = require('../models/GameState');
const router = express.Router();

// Simple password strength check (you already had something similar)
function isStrongPassword(pw) {
  if (typeof pw !== 'string') return false;
  const lengthOK = pw.length >= 10;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const digit = /[0-9]/.test(pw);
  return lengthOK && upper && lower && digit;
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: 'Password not strong enough' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash: hash });

  
    return res.status(201).json({
      message: 'Signup ok',
      username: user.username,
    });
  } catch (err) {
    console.error('Signup error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});



router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // If you still want a session, keep this simple:
    if (req.session) {
      req.session.userId = user._id.toString();
      req.session.username = user.username;
    }

    return res.json({
      message: 'Login successful',
      username: user.username,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});




// POST /api/auth/logout
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

// routes/leaderboard.js
const express = require('express');
const router = express.Router();
const Run = require('../models/Run');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

// POST /api/leaderboard/:levelId
// Body: { timeSec }
router.post('/:levelId', async (req, res) => {
  try {
    const levelId = parseInt(req.params.levelId, 10);
    const { timeSec, username: bodyUsername } = req.body;

    if (!Number.isFinite(timeSec) || timeSec <= 0) {
      return res.status(400).json({ error: 'Invalid timeSec' });
    }
    if (!Number.isInteger(levelId)) {
      return res.status(400).json({ error: 'Invalid levelId' });
    }

    let username = bodyUsername;

    // Optional: if session happens to work later, prefer that
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId).lean();
      if (user && user.username) {
        username = user.username;
      }
    }

    if (!username) {
      return res.status(400).json({ error: 'User not found or missing username' });
    }

    // upsert best time for this username + level
    const existing = await Run.findOne({ username, level: levelId });

    if (!existing) {
      await Run.create({ username, level: levelId, timeSec });
    } else if (timeSec < existing.timeSec) {
      existing.timeSec = timeSec;
      await existing.save();
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Submit leaderboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET /api/leaderboard/:levelId?limit=5
router.get('/:levelId', async (req, res) => {
  try {
    const levelId = parseInt(req.params.levelId, 5);
    const limit   = parseInt(req.query.limit || '5', 5);

    if (!Number.isInteger(levelId)) {
      return res.status(400).json({ error: 'Invalid levelId' });
    }

    const runs = await Run.find({ level: levelId })
      .sort({ timeSec: 1 })   // fastest first
      .limit(limit)
      .lean();

    const scores = runs.map(r => ({
      playerName: r.username,
      timeSec:    r.timeSec,
      createdAt:  r.createdAt,
    }));

    res.json({ levelId, scores });
  } catch (err) {
    console.error('Get leaderboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

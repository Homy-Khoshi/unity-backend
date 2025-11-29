// routes/leaderboard.js
const express = require('express');
const router = express.Router();
const Run = require('../models/Run');
const User = require('../models/User');

// ---------------------------
// POST /api/leaderboard/:levelId
// Body: { timeSec: number, username: string }
// ---------------------------
router.post('/:levelId', async (req, res) => {
  try {
    const levelId = parseInt(req.params.levelId, 10);
    const { timeSec, username } = req.body;

    if (!Number.isInteger(levelId)) {
      return res.status(400).json({ error: 'Invalid levelId' });
    }
    const timeNum = Number(timeSec);
    if (!Number.isFinite(timeNum) || timeNum <= 0) {
      return res.status(400).json({ error: 'Invalid timeSec' });
    }
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Missing username' });
    }

    // Find the user by username (string field on User)
    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const timeMs = Math.round(timeNum * 1000);

    // One best time per user per level
    const existing = await Run.findOne({
      username: user._id,
      levelId,
    });

    if (!existing) {
      await Run.create({
        username: user._id,
        levelId,
        timeMs,
      });
    } else if (timeMs < existing.timeMs) {
      existing.timeMs = timeMs;
      await existing.save();
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Submit leaderboard error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ---------------------------
// GET /api/leaderboard/:levelId
// Returns top runs for that level
// ---------------------------
router.get('/:levelId', async (req, res) => {
  try {
    const levelId = parseInt(req.params.levelId, 10);
    if (!Number.isInteger(levelId)) {
      return res.status(400).json({ error: 'Invalid levelId' });
    }

    const runs = await Run.find({ levelId })
      .sort({ timeMs: 1 })         // fastest first
      .limit(20)
      .populate('username', 'username'); // get the username string

    const scores = runs.map(r => ({
      playerName: r.username.username, // r.username is a User doc
      timeSec: r.timeMs / 1000,
      createdAt: r.created_at,
    }));

    return res.json({ levelId, scores });
  } catch (err) {
    console.error('Get leaderboard error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

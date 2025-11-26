// routes/leaderboard.js
const express = require('express');
const router = express.Router();
const Run = require('../models/Run');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

// POST /api/leaderboard/:levelId
router.post('/:levelId', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId; // from your Mongo session
    const levelId = parseInt(req.params.levelId, 10);
    const { timeSec } = req.body;

    if (!Number.isFinite(timeSec) || timeSec <= 0) {
      return res.status(400).json({ error: 'Invalid timeSec' });
    }
    if (!Number.isInteger(levelId)) {
      return res.status(400).json({ error: 'Invalid levelId' });
    }

    const timeMs = Math.round(timeSec * 1000);

    // upsert and keep the MIN time
    const run = await Run.findOne({ user: userId, levelId });

    if (!run) {
      await Run.create({ user: userId, levelId, timeMs });
    } else if (timeMs < run.timeMs) {
      run.timeMs = timeMs;
      await run.save();
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Submit run error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/leaderboard/:levelId?limit=10
router.get('/:levelId', async (req, res) => {
  try {
    const levelId = parseInt(req.params.levelId, 10);
    const limit = parseInt(req.query.limit || '10', 10);

    if (!Number.isInteger(levelId)) {
      return res.status(400).json({ error: 'Invalid levelId' });
    }

    const runs = await Run.find({ levelId })
      .sort({ timeMs: 1 })           // fastest first
      .limit(limit)
      .populate('user', 'username')  // get username from User collection
      .lean();

    const scores = runs.map(r => ({
      playerName: r.user?.username || 'Unknown',
      timeSec: r.timeMs / 1000,
      createdAt: r.created_at,
    }));

    res.json({ levelId, scores });
  } catch (err) {
    console.error('Get leaderboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

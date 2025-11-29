// routes/leaderboard.js
const express = require('express');
const router = express.Router();
const Run = require('../models/Run');
const User = require('../models/User');

// POST /api/leaderboard/:levelId
// Body: { timeSec: number, username: string }
router.post('/:levelId', async (req, res) => {
  try {
    const levelId = parseInt(req.params.levelId, 10);
    const { timeSec, username } = req.body || {};

    console.log('Submit score body:', req.body);

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

    // find the User document by username string
    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const timeMs = Math.round(timeNum * 1000);

    // one best time per user per levelId
    let run = await Run.findOne({
      username: user._id,
      levelId,
    });

    if (!run) {
      run = await Run.create({
        username: user._id,
        levelId,
        timeMs,
      });
    } else if (timeMs < run.timeMs) {
      run.timeMs = timeMs;
      await run.save();
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Submit leaderboard error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET /api/leaderboard/:levelId
router.get('/:levelId', async (req, res) => {
  try {
    const levelId = parseInt(req.params.levelId, 10);
    if (!Number.isInteger(levelId)) {
      return res.status(400).json({ error: 'Invalid levelId' });
    }

    const runs = await Run.find({ levelId })
      .sort({ timeMs: 1 })
      .limit(20)
      .populate('username', 'username'); // bring back the username string

    const scores = runs.map(r => ({
      playerName: r.username.username,
      timeSec: r.timeMs / 1000,
      createdAt: r.created_at,
    }));

    return res.json({ levelId, scores });
  } catch (err) {
    console.error('Get leaderboard error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;

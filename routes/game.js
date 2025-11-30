// routes/game.js
const express = require('express');
const Checkpoint = require('../models/Checkpoint');

const router = express.Router();

/**
 * GET /api/game/state?username=foo
 * Returns (and creates if missing) the checkpoint for the given username.
 * We no longer depend on sessions here, so Unity can pass username directly.
 */
router.get('/state', async (req, res) => {
  try {
    const username = req.query.username;

    if (!username) {
      return res.status(400).json({ error: 'username query parameter is required' });
    }

    let state = await Checkpoint.findOne({ username });

    if (!state) {
      state = await Checkpoint.create({
        username,
        level: 1,
        coins: 0,
        lastScene: '1'
      });
    }

    return res.json({
      username: state.username,
      level: state.level,
      coins: state.coins,
      lastScene: state.lastScene
    });
  } catch (err) {
    console.error('Error in GET /api/game/state:', err);
    res.status(500).json({ error: 'Error fetching game state' });
  }
});

/**
 * POST /api/game/checkpoint
 * Body: { "username": "foo", "lastScene": "2", "level": 2, "coins": 100 }
 */
router.post('/checkpoint', async (req, res) => {
  try {
    const { username, lastScene, level, coins } = req.body || {};

    if (!username) {
      return res.status(400).json({ error: 'username is required' });
    }
    if (!lastScene || typeof lastScene !== 'string') {
      return res.status(400).json({ error: 'lastScene is required as a string' });
    }

    const update = { lastScene };
    if (typeof level === 'number') update.level = level;
    if (typeof coins === 'number') update.coins = coins;

    const state = await Checkpoint.findOneAndUpdate(
      { username },
      update,
      { new: true, upsert: true }
    );

    res.json({
      username: state.username,
      level: state.level,
      coins: state.coins,
      lastScene: state.lastScene
    });
  } catch (err) {
    console.error('Error in POST /api/game/checkpoint:', err);
    res.status(500).json({ error: 'Error updating checkpoint' });
  }
});

module.exports = router;

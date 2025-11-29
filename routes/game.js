// routes/game.js
const express = require('express');
const Checkpoint = require('../models/Checkpoint');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

function getUsername(req) {
  return req.session && req.session.username;
}

// -------------------------------------
// GET /api/game/state
//  -> get (or create) current user's checkpoint
// -------------------------------------
router.get('/state', requireAuth, async (req, res) => {
  try {
    const username = getUsername(req);
    if (!username) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    let state = await Checkpoint.findOne({ username });

    if (!state) {
      // Create default checkpoint if none exists
      state = await Checkpoint.create({
        username,
        level: 1,
        coins: 0,
        lastScene: '1'
      });
    }

    // Only send the important fields to Unity
    res.json({
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

// -------------------------------------
// POST /api/game/checkpoint
//  -> update lastScene (and optional level/coins)
// -------------------------------------
router.post('/checkpoint', requireAuth, async (req, res) => {
  try {
    const username = getUsername(req);
    if (!username) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const { lastScene, level, coins } = req.body || {};

    if (!lastScene || typeof lastScene !== 'string') {
      return res.status(400).json({ error: 'lastScene is required' });
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
    res.status(500).json({ error: 'Error updating game state' });
  }
});

module.exports = router;

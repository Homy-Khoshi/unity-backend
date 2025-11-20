const express = require('express');
const GameState = require('../models/GameState');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Get current user's game state
router.get('/state', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const state = await GameState.findOne({ user: userId });

    if (!state) {
      // Create default if none exists
      const newState = await GameState.create({ user: userId });
      return res.json(newState);
    }

    res.json(state);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching game state' });
  }
});

// Update current user's game state
router.post('/state', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const update = req.body;

    // Authorization: user can ONLY edit their own state
    // We ignore any userId in the body.
    const state = await GameState.findOneAndUpdate(
      { user: userId },
      update,
      { new: true, upsert: true }
    );

    res.json(state);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating game state' });
  }
});

module.exports = router;

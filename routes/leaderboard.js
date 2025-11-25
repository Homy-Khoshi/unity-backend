const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');

const { insertGameTime, getFastestRuns } = require('../db/gameQueries');
const requireAuth = require('../middleware/requireAuth');

router.post('/:levelId',requireAuth, async (req, res) => {
    try{
        const userId = req.session.userId;
        const levelId = parseInt(req.params.levelId);
        const { timeSec } = req.body;

        if (!Number.isFinite(timeSec) || time <= 0){
            return res.status(400).json({ error: 'Invalid time' });
        }
        if (!Number.isInteger(levelId)) {
            return res.status(400).json({ error: 'Invalid levelId' });
        }
        const timeMs = Math.round(timeSec * 1000);
        await insertGameTime (pool, userId, levelId, timeMs);
        res.json({ message: 'Game time recorded' });

    }catch (err){
        console.error('Submit run error:', err);
        res.status(500).json({ error: 'Server error' });
    }       
});

router.get('/:levelId', async (req, res) => {
    try{
        const levelId = parseInt(req.params.levelId);
        const limit = parseInt(req.query.limit) || 10;

        if (!Number.isInteger(levelId)) {
            return res.status(400).json({ error: 'Invalid levelId' });
        }

        const runs = await getFastestRuns(pool, levelId, limit);
         res.json({
            levelId,
            scores: rows.map(r => ({
                playerName: r.username,
                timeSec: r.time_ms / 1000,
                createdAt: r.created_at,
            })),
            });
    }catch (err){
        console.error('Get leaderboard error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;

let insertGameTime = async (pool, userId, levelId, timeMs) => {
    const [result] = await pool.query(
        `INSERT INTO runs (user_id, level_id, time_ms)
        values (?, ?, ?)
        on duplicate key update
        time_ms = LEAST(time_ms, VALUES(time_ms))
        created_at = IF(VALUES(time_ms) < time_ms, VALUES(created_at), created_at)`);

    return result;
}

module.exports = {
    insertGameTime,
};
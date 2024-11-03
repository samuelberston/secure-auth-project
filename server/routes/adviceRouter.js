// Advice router
const AdviceRouter = require("express").Router();

// PostgreSQL connection
const pool = require('../psql.js');

/**
 * @route GET /advice
 * @desc Retrieves the advice of the day based on the current day of the week.
 * @returns {Object} - JSON object containing the advice of the day.
 */
AdviceRouter.get('/', async (req, res) => {
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const advice = await pool.query('SELECT advice FROM advice WHERE day_of_week = $1', [dayOfWeek]);
    return res.status(200).json(advice.rows[0]);
});

module.exports = AdviceRouter;

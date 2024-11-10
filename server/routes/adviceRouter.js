// Advice router
const AdviceRouter = require("express").Router();
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

const logger = require('../logger.js');
const pool = require('../psql.js');

// Rate limiting middleware
const adviceLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

AdviceRouter.use(adviceLimiter);

// Cache object
const adviceCache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours

/**
 * @route GET /advice
 * @desc Retrieves the advice of the day based on the current day of the week.
 * @returns {Object} - JSON object containing the advice of the day.
 */
AdviceRouter.get('/', async (req, res) => {
    try {
        const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

        // Return cached advice if available
        if (adviceCache.get(dayOfWeek)) {
            logger.info(`Sent cached advice to IP: %s`, req.ip);
            return res.status(200).json({ advice: adviceCache.get(dayOfWeek) });
        }
        const advice = await pool.query('SELECT advice FROM advice WHERE day_of_week = $1', [dayOfWeek]);
        if (advice.rows.length === 0) {
            logger.error(`Advice was not found from the database`);
            return res.status(404).json({ message: "No advice found for today" });
        }
        // Cache the advice
        adviceCache.set(dayOfWeek, advice.rows[0].advice) = dayOfWeek;
        logger.info(`Sent advice to IP: %s`, req.ip);
        return res.status(200).json(advice.rows[0]);
    } catch (err) {
        console.error("Error fetching advice: ", err);
        logger.error(`Error while sending advice to IP: %s. Error: %s`, req.ip, err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = AdviceRouter;

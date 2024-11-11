// logger.js
const { createLogger, format, transports } = require('winston');
const path = require('path');

// const logDir = path.join(__dirname, 'server');

const logger = createLogger({
  level: 'info', // Default log level
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // Error logs
    new transports.File({ filename: 'logs/combined.log' }) // All logs
  ]
});

// If in development, add a simpler console format
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
        format.colorize(),
        format.simple()
        )
    }));
}
  
module.exports = logger;
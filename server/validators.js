const { body } = require('express-validator');

/**
 *      Username validator
 * 
 *      Requirements:
 *      - not a reserved username
 *      - between 3 and 30 characters
 *      - alphanumeric with _ and .
 *      - must start/end with letter or number
 * 
 */
const reservedUsernames = ['admin', 'root', 'system', 'support'];

const usernameValidator = body('username')
  .isLength({ min: 3 })
  .withMessage('Username must be between 3 and 30 characters long')
  .isLength({ max: 30 })
  .withMessage('Username must be between 3 and 30 characters long')
  .matches(/^[a-zA-Z0-9._]+$/)
  .withMessage('Username must contain only letters, numbers, underscores, or periods')
  .matches(/^[a-zA-Z0-9]/)
  .withMessage('Username must start with a letter or number')
  .matches(/[a-zA-Z0-9]$/)
  .withMessage('Username must end with a letter or number')
  .custom((value) => !reservedUsernames.includes(value.toLowerCase()))
  .withMessage('This username is reserved and cannot be used');

/**
 *      Password validator
 */
const passwordValidator = body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .isLength({ max: 64})
    .withMessage('Password must be less than 64 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character')
    .not()
    .matches(/\s/)
    .withMessage('Password must not contain spaces');

module.exports = {
    usernameValidator,
    passwordValidator
};

// Connect to database
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  database: process.env.DB_NAME,
  password: '',
  port: 5432
});

// Seed database with a few fake users, until I implement the create user functionality ... 

module.exports = pool;
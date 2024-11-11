// Connect to database
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DD_URL,
  database: process.env.DB_NAME,
  password: '',
  port: 5432
});

module.exports = pool;
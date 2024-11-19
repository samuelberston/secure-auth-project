// Connect to database
// const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || "samuelberston",
  host: process.env.DD_URL || 'host.docker.internal',
  database: process.env.DB_NAME || "auth_db",
  password: '',
  port: 5432
});

module.exports = pool;
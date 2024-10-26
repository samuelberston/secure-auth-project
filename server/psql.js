// Connect to database
const fs = require('fs')
const { Pool } = require('pg');


const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  database: process.env.DB_NAME,
  password: '',
  port: 5432
});

if (process.env.NODE_ENV !== 'production') {
  const seedQuery = fs.readFileSync('database/schema.sql', { encoding: 'utf8' })
  pool.query(seedQuery, (err, res) => {
      // console.log(err, res)
      console.log('Seeding Completed!')
  })
}

module.exports = pool;
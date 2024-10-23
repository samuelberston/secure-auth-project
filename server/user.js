// Hash the password with salt
const bcrypt = require('bcrypt');
const saltRounds = 10; 

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return { salt, hash };
};

// Store credentials 
const pool = require('./db');  // PostgreSQL connection
const { uuidv4 } = require('uuid');

const createUser = async (username, password) => {
  const { salt, hash } = await hashPassword(password);

  const user_uuid = uuidv4();
  
  const query = `INSERT INTO users (user_uuid, username, password_hash, salt) VALUES ($1, $2, $3, $4) RETURNING user_uuid`;
  const values = [user_uuid, username, hash, salt];
  
  try {
    const res = await pool.query(query, values);
    console.log('User created with ID:', res.rows[0].id);
  } catch (err) {
    console.error('Error creating user:', err);
  }
};

module.exports = createUser;

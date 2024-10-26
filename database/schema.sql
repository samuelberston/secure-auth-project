/* DROP DATABASE IF EXISTS auth_db;

CREATE DATABASE auth_db;

CREATE SCHEMA auth_db;  */

CREATE TABLE users (
    user_uuid UUID PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
)
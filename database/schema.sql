DROP DATABASE IF EXISTS auth_db;

CREATE DATABASE auth_db;

CREATE SCHEMA auth_db;

CREATE TABLE users (
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT_NULL.,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
)
/* DROP DATABASE IF EXISTS auth_db;

CREATE DATABASE auth_db;

CREATE SCHEMA auth_db;  */

/* Users table */
CREATE TABLE users (
    user_uuid UUID PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

/* Federated credentials table */
CREATE TABLE federated_credentials (
    credential_id SERIAL PRIMARY KEY,
    user_uuid UUID REFERENCES users(user_uuid),
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

/* Advice of the day */
CREATE TABLE advice (
    advice_id SERIAL PRIMARY KEY,
    advice TEXT NOT NULL,
    day_of_week VARCHAR(10) NOT NULL
);

/* Seed advice of the day table */
INSERT INTO advice (advice, day_of_week) VALUES ('Eat a healthy breakfast', 'Monday');
INSERT INTO advice (advice, day_of_week) VALUES ('Take a walk', 'Tuesday');
INSERT INTO advice (advice, day_of_week) VALUES ('Learn something new', 'Wednesday');
INSERT INTO advice (advice, day_of_week) VALUES ('Eat a healthy lunch', 'Thursday');
INSERT INTO advice (advice, day_of_week) VALUES ('Take a nap', 'Friday');
INSERT INTO advice (advice, day_of_week) VALUES ('Enjoy a healthy dinner', 'Saturday');
INSERT INTO advice (advice, day_of_week) VALUES ('Relax and enjoy your day off', 'Sunday');

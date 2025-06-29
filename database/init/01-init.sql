-- Create database
CREATE DATABASE "pana-inscriptions-db";

-- Connect to the database
\c "pana-inscriptions-db";

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom enum types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('DELEGATE', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create coaches table for tournament registrations
CREATE TABLE IF NOT EXISTS coaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fig_id VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    country VARCHAR(10) NOT NULL,
    level VARCHAR(255) NOT NULL,
    level_description VARCHAR(500) NOT NULL,
    tournament_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'REGISTERED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_coaches_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    UNIQUE(fig_id, tournament_id)
);

-- Create judges table for tournament registrations
CREATE TABLE IF NOT EXISTS judges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fig_id VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    birth VARCHAR(50) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    country VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL,
    category_description VARCHAR(255) NOT NULL,
    tournament_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'REGISTERED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_judges_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    UNIQUE(fig_id, tournament_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coaches_country ON coaches(country);
CREATE INDEX IF NOT EXISTS idx_coaches_tournament ON coaches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_coaches_fig_id ON coaches(fig_id);

CREATE INDEX IF NOT EXISTS idx_judges_country ON judges(country);
CREATE INDEX IF NOT EXISTS idx_judges_tournament ON judges(tournament_id);
CREATE INDEX IF NOT EXISTS idx_judges_fig_id ON judges(fig_id);
CREATE INDEX IF NOT EXISTS idx_judges_category ON judges(category);

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    country VARCHAR(10) NOT NULL,
    role user_role NOT NULL DEFAULT 'DELEGATE',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user_sessions table for session tracking
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    jwt_id VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for user authentication tables
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_user_sessions_jwt_id ON user_sessions(jwt_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Insert sample delegate users for testing (passwords are 'password123' hashed)
-- Note: In production, these should be properly hashed and inserted via secure process
INSERT INTO users (username, password_hash, country, role) VALUES 
    ('usa_delegate', '$2b$10$example_hash_for_password123', 'USA', 'DELEGATE'),
    ('can_delegate', '$2b$10$example_hash_for_password123', 'CAN', 'DELEGATE'),
    ('mex_delegate', '$2b$10$example_hash_for_password123', 'MEX', 'DELEGATE'),
    ('admin', '$2b$10$example_hash_for_password123', 'ADMIN', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- Tables will be created automatically by TypeORM synchronization in development
-- In production, migrations will be used instead of synchronization 
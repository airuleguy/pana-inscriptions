-- Create database
CREATE DATABASE "pana-inscriptions-db";

-- Connect to the database
\c "pana-inscriptions-db";

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Tables will be created automatically by TypeORM synchronization in development
-- In production, migrations will be used instead of synchronization 
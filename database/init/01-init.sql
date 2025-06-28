-- Create database
CREATE DATABASE "pana-inscriptions-db";

-- Connect to the database
\c "pana-inscriptions-db";

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tables will be created automatically by TypeORM synchronization in development
-- In production, migrations will be used instead of synchronization 
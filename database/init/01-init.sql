-- Create database
CREATE DATABASE "pana-inscriptions-db";

-- Connect to the database
\c "pana-inscriptions-db";

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be created automatically by TypeORM synchronization
-- This file ensures the database exists and has the required extensions 
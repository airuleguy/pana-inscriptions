-- Migration: Add Tournament table and update Choreography table
-- Description: Creates tournaments table and adds tournament_id foreign key to choreographies

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('CAMPEONATO_PANAMERICANO', 'COPA_PANAMERICANA')),
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add tournament_id to choreographies table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'choreographies' AND column_name = 'tournament_id') THEN
        ALTER TABLE choreographies ADD COLUMN tournament_id UUID;
    END IF;
END $$;

-- Add foreign key constraint (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_choreographies_tournament') THEN
        ALTER TABLE choreographies 
        ADD CONSTRAINT fk_choreographies_tournament 
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournaments_type ON tournaments(type);
CREATE INDEX IF NOT EXISTS idx_tournaments_active ON tournaments(is_active);
CREATE INDEX IF NOT EXISTS idx_tournaments_dates ON tournaments(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_choreographies_tournament ON choreographies(tournament_id);

-- Insert the two default tournaments
INSERT INTO tournaments (name, short_name, type, description, start_date, end_date, location, is_active)
VALUES 
    (
        'Campeonato Panamericano de Gimnasia Aeróbica',
        'Campeonato Panamericano',
        'CAMPEONATO_PANAMERICANO',
        'The premier Pan-American championship for aerobic gymnastics, featuring the highest level of competition with strict eligibility requirements and limited entries per country.',
        '2024-07-15',
        '2024-07-21',
        'Lima, Peru',
        true
    ),
    (
        'Copa Panamericana de Gimnasia Aeróbica',
        'Copa Panamericana',
        'COPA_PANAMERICANA',
        'A developmental competition open to Pan-American countries and guest nations, promoting the growth of aerobic gymnastics across the region.',
        '2024-09-10',
        '2024-09-16',
        'Mexico City, Mexico',
        true
    )
ON CONFLICT DO NOTHING;

-- Update the updated_at timestamp function for tournaments
CREATE OR REPLACE FUNCTION update_tournaments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tournaments updated_at
DROP TRIGGER IF EXISTS trigger_tournaments_updated_at ON tournaments;
CREATE TRIGGER trigger_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_tournaments_updated_at(); 
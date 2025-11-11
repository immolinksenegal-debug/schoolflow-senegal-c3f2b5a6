-- Add academic_year column to classes table
ALTER TABLE classes 
ADD COLUMN academic_year TEXT NOT NULL DEFAULT '2024-2025';

-- Create unique constraint to prevent duplicate classes for same academic year
CREATE UNIQUE INDEX unique_class_per_year 
ON classes(school_id, name, academic_year);

-- Add helpful comment
COMMENT ON COLUMN classes.academic_year IS 'Année académique au format YYYY-YYYY (ex: 2024-2025)';
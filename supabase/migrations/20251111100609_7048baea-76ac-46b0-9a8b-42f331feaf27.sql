-- Add unique constraints for parent phone and email to prevent duplicates
-- First, we need to handle existing duplicates by keeping only the most recent entry

-- Create a unique index on parent_phone (excluding null values)
CREATE UNIQUE INDEX unique_parent_phone ON students(parent_phone) 
WHERE parent_phone IS NOT NULL AND parent_phone != '';

-- Create a unique index on parent_email (excluding null and empty values)
CREATE UNIQUE INDEX unique_parent_email ON students(parent_email) 
WHERE parent_email IS NOT NULL AND parent_email != '';
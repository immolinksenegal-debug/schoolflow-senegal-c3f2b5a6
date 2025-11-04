-- Clean up duplicate schools, keeping only the most recent one
-- First, let's identify which schools to keep
WITH schools_to_keep AS (
  SELECT DISTINCT ON (email) id
  FROM schools
  WHERE email IS NOT NULL
  ORDER BY email, created_at DESC
),
schools_to_delete AS (
  SELECT id FROM schools
  WHERE email IS NOT NULL
  AND id NOT IN (SELECT id FROM schools_to_keep)
)
-- Delete old duplicates (this will also cascade delete related data)
DELETE FROM schools WHERE id IN (SELECT id FROM schools_to_delete);

-- Now add unique constraints to prevent future duplicates

-- For students table: Make email and phone unique within each school
CREATE UNIQUE INDEX IF NOT EXISTS students_email_unique 
ON students(school_id, email) 
WHERE email IS NOT NULL AND email != '';

CREATE UNIQUE INDEX IF NOT EXISTS students_phone_unique 
ON students(school_id, phone) 
WHERE phone IS NOT NULL AND phone != '';

CREATE UNIQUE INDEX IF NOT EXISTS students_parent_phone_unique 
ON students(school_id, parent_phone);

CREATE UNIQUE INDEX IF NOT EXISTS students_parent_email_unique 
ON students(school_id, parent_email) 
WHERE parent_email IS NOT NULL AND parent_email != '';

-- For profiles table: Make phone unique globally
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique 
ON profiles(phone) 
WHERE phone IS NOT NULL AND phone != '';

-- For schools table: Make email and phone unique globally
CREATE UNIQUE INDEX IF NOT EXISTS schools_email_unique 
ON schools(email) 
WHERE email IS NOT NULL AND email != '';

CREATE UNIQUE INDEX IF NOT EXISTS schools_phone_unique 
ON schools(phone) 
WHERE phone IS NOT NULL AND phone != '';
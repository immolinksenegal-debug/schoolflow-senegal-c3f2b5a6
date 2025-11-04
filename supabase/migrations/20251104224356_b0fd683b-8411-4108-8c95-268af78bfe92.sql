-- Clean up duplicate schools and add unique constraints

-- Step 1: Delete duplicate schools (keep the most recent one for each email)
WITH duplicates AS (
  SELECT 
    id,
    email,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM schools
  WHERE email IS NOT NULL
)
DELETE FROM schools 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Step 2: Clean up any duplicate phones in schools
WITH phone_duplicates AS (
  SELECT 
    id,
    phone,
    ROW_NUMBER() OVER (PARTITION BY phone ORDER BY created_at DESC) as rn
  FROM schools
  WHERE phone IS NOT NULL AND phone != ''
)
DELETE FROM schools 
WHERE id IN (
  SELECT id FROM phone_duplicates WHERE rn > 1
);

-- Step 3: Add unique constraints for schools
CREATE UNIQUE INDEX IF NOT EXISTS schools_email_unique 
ON schools(email) 
WHERE email IS NOT NULL AND email != '';

CREATE UNIQUE INDEX IF NOT EXISTS schools_phone_unique 
ON schools(phone) 
WHERE phone IS NOT NULL AND phone != '';

-- Step 4: Add unique constraints for profiles
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique 
ON profiles(phone) 
WHERE phone IS NOT NULL AND phone != '';

-- Step 5: Add unique constraints for students (scoped to school)
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
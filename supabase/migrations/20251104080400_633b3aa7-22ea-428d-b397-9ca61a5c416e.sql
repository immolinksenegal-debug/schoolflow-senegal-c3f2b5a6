-- Add unique constraints for student data (not parent data)
-- Matricule is already unique by default, but let's ensure it

-- Make email unique when provided (nullable fields can have multiple nulls)
CREATE UNIQUE INDEX students_email_unique 
ON public.students(email) 
WHERE email IS NOT NULL AND email != '';

-- Make phone unique when provided
CREATE UNIQUE INDEX students_phone_unique 
ON public.students(phone) 
WHERE phone IS NOT NULL AND phone != '';

-- Add check constraint to ensure matricule format
ALTER TABLE public.students
ADD CONSTRAINT students_matricule_check 
CHECK (length(matricule) >= 3);

-- Note: We do NOT add unique constraints on parent_email and parent_phone
-- because multiple students can share the same parent contact information
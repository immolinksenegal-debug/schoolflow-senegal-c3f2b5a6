-- Add subscription plan type to schools table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
    CREATE TYPE subscription_plan AS ENUM ('free', 'monthly', 'annual');
  END IF;
END $$;

ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS subscription_plan subscription_plan DEFAULT 'free',
ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 30;

-- Create function to check student limit
CREATE OR REPLACE FUNCTION public.check_student_limit(_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_count INTEGER;
  max_limit INTEGER;
  plan subscription_plan;
  result jsonb;
BEGIN
  -- Get school subscription info
  SELECT subscription_plan, max_students 
  INTO plan, max_limit
  FROM public.schools
  WHERE id = _school_id;
  
  -- Count current students
  SELECT COUNT(*)
  INTO student_count
  FROM public.students
  WHERE school_id = _school_id;
  
  -- Build result
  result := jsonb_build_object(
    'current_count', student_count,
    'max_limit', max_limit,
    'plan', plan,
    'can_add', student_count < max_limit OR plan != 'free',
    'remaining', GREATEST(0, max_limit - student_count)
  );
  
  RETURN result;
END;
$$;

-- Update existing schools to have free plan
UPDATE public.schools 
SET subscription_plan = 'free', max_students = 30
WHERE subscription_plan IS NULL;
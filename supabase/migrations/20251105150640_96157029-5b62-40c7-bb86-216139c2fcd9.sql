-- Modifier la fonction check_student_limit pour gérer les comptes illimités (max_students = -1)
CREATE OR REPLACE FUNCTION public.check_student_limit(_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Si max_students = -1, c'est un compte illimité
  IF max_limit = -1 THEN
    result := jsonb_build_object(
      'current_count', student_count,
      'max_limit', -1,
      'plan', plan,
      'can_add', true,
      'remaining', -1
    );
  ELSE
    -- Build result normal
    result := jsonb_build_object(
      'current_count', student_count,
      'max_limit', max_limit,
      'plan', plan,
      'can_add', student_count < max_limit OR plan != 'free',
      'remaining', GREATEST(0, max_limit - student_count)
    );
  END IF;
  
  RETURN result;
END;
$function$;
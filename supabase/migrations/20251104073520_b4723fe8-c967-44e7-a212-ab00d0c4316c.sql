-- Fix security issue: Restrict parent data access to admins only
-- Drop the existing policy that allows all users to view students
DROP POLICY IF EXISTS "Users can view students in their school" ON public.students;

-- Create new restrictive policy: Only admins can view students with parent data
CREATE POLICY "School admins can view students in their school"
ON public.students
FOR SELECT
USING (
  school_id = get_user_school(auth.uid()) 
  AND (
    has_role(auth.uid(), 'school_admin'::app_role) 
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
);
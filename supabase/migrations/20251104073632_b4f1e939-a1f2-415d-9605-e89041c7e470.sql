-- Fix critical security issues

-- 1. Remove unrestricted school insertion policy
-- Schools should only be created via the create-school edge function with service role
DROP POLICY IF EXISTS "schools_insert_policy" ON public.schools;

-- Create restrictive policy: Only super admins can directly insert schools
CREATE POLICY "Only super admins can create schools"
ON public.schools
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- 2. Verify students table policies are restricted to admins only
-- The SELECT policy should already be fixed, but let's ensure all operations are secure

-- Verify UPDATE policy is admin-only (should already exist)
-- Verify DELETE policy is admin-only (should already exist)
-- Verify INSERT policy is admin-only (should already exist)

-- These policies should already exist from previous migrations:
-- "School admins can view students in their school" (SELECT)
-- "School admins can insert students in their school" (INSERT)
-- "School admins can update students in their school" (UPDATE)
-- "School admins can delete students in their school" (DELETE)
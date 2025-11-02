-- Disable RLS temporarily to see all policies
ALTER TABLE public.schools DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on schools table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'schools' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.schools';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for schools table
-- Allow authenticated users to INSERT
CREATE POLICY "schools_insert_policy"
  ON public.schools
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow super admins to do everything
CREATE POLICY "schools_super_admin_all"
  ON public.schools
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Allow users to view their own school
CREATE POLICY "schools_select_own"
  ON public.schools
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT school_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );
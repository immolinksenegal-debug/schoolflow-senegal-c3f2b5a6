-- Drop all existing INSERT policies on schools to start fresh
DROP POLICY IF EXISTS "Authenticated users can create schools" ON public.schools;
DROP POLICY IF EXISTS "Authenticated users can create their school" ON public.schools;

-- Create a clear and simple INSERT policy for schools
CREATE POLICY "Allow authenticated users to insert schools"
  ON public.schools
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Also ensure users can update their own profile's school_id
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
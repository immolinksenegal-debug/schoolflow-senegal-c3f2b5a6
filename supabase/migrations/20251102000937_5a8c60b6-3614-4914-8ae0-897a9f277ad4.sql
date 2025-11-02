-- Drop the problematic policy
DROP POLICY IF EXISTS "Authenticated users can create their school" ON public.schools;

-- Create a simpler policy that allows authenticated users to insert schools
CREATE POLICY "Authenticated users can create schools"
  ON public.schools
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
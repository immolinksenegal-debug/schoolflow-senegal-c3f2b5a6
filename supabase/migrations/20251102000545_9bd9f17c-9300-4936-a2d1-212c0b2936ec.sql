-- Allow authenticated users without a school to create one
CREATE POLICY "Authenticated users can create their school"
  ON public.schools
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if user doesn't have a school yet
    NOT EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND school_id IS NOT NULL
    )
  );
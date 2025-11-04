-- Add UPDATE policy for schools so school admins can update their own school
CREATE POLICY "School admins can update their own school"
ON public.schools
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT school_id
    FROM public.profiles
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  id IN (
    SELECT school_id
    FROM public.profiles
    WHERE user_id = auth.uid()
  )
);

-- Ensure profiles table has proper UPDATE policy for school_id
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND
  -- Prevent users from changing their school_id unless they're super admin
  (school_id IS NULL OR school_id = (
    SELECT school_id FROM public.profiles WHERE user_id = auth.uid()
  ) OR has_role(auth.uid(), 'super_admin'))
);
-- Create classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 30,
  teacher_name TEXT,
  room_number TEXT,
  schedule TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Policies for classes
CREATE POLICY "School admins can view classes in their school"
ON public.classes
FOR SELECT
USING (
  school_id = get_user_school(auth.uid()) AND
  (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "School admins can insert classes in their school"
ON public.classes
FOR INSERT
WITH CHECK (
  school_id = get_user_school(auth.uid()) AND
  (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "School admins can update classes in their school"
ON public.classes
FOR UPDATE
USING (
  school_id = get_user_school(auth.uid()) AND
  (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "School admins can delete classes in their school"
ON public.classes
FOR DELETE
USING (
  school_id = get_user_school(auth.uid()) AND
  (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

-- Add trigger for updated_at
CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
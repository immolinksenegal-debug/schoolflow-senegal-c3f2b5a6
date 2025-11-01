-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  matricule TEXT NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  class TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(school_id, matricule)
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students
CREATE POLICY "Users can view students in their school"
  ON public.students
  FOR SELECT
  USING (school_id = get_user_school(auth.uid()));

CREATE POLICY "School admins can insert students in their school"
  ON public.students
  FOR INSERT
  WITH CHECK (
    school_id = get_user_school(auth.uid()) AND
    (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  );

CREATE POLICY "School admins can update students in their school"
  ON public.students
  FOR UPDATE
  USING (
    school_id = get_user_school(auth.uid()) AND
    (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  );

CREATE POLICY "School admins can delete students in their school"
  ON public.students
  FOR DELETE
  USING (
    school_id = get_user_school(auth.uid()) AND
    (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  );

-- Create trigger for updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better performance
CREATE INDEX idx_students_school_id ON public.students(school_id);
CREATE INDEX idx_students_matricule ON public.students(matricule);
CREATE INDEX idx_students_class ON public.students(class);
-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  signatory TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'generated',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT certificates_status_check CHECK (status IN ('generated', 'pending'))
);

-- Enable Row Level Security
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Create policies for certificates
CREATE POLICY "School admins can view certificates in their school"
ON public.certificates
FOR SELECT
USING (
  school_id = get_user_school(auth.uid()) AND
  (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "School admins can insert certificates in their school"
ON public.certificates
FOR INSERT
WITH CHECK (
  school_id = get_user_school(auth.uid()) AND
  (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "School admins can update certificates in their school"
ON public.certificates
FOR UPDATE
USING (
  school_id = get_user_school(auth.uid()) AND
  (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "School admins can delete certificates in their school"
ON public.certificates
FOR DELETE
USING (
  school_id = get_user_school(auth.uid()) AND
  (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

-- Add foreign key constraint
ALTER TABLE public.certificates
ADD CONSTRAINT certificates_student_id_fkey
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX idx_certificates_school_id ON public.certificates(school_id);
CREATE INDEX idx_certificates_student_id ON public.certificates(student_id);
CREATE INDEX idx_certificates_status ON public.certificates(status);
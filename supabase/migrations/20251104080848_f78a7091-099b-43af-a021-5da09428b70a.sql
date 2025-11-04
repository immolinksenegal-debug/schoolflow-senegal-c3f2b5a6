-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mobile_money', 'bank_transfer', 'check', 'other')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('tuition', 'registration', 'exam', 'transport', 'canteen', 'uniform', 'books', 'other')),
  payment_period TEXT,
  academic_year TEXT NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_reference TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "School admins can view payments in their school"
ON public.payments
FOR SELECT
USING (
  school_id = get_user_school(auth.uid()) AND
  (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "School admins can insert payments in their school"
ON public.payments
FOR INSERT
WITH CHECK (
  school_id = get_user_school(auth.uid()) AND
  (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "School admins can update payments in their school"
ON public.payments
FOR UPDATE
USING (
  school_id = get_user_school(auth.uid()) AND
  (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "School admins can delete payments in their school"
ON public.payments
FOR DELETE
USING (
  school_id = get_user_school(auth.uid()) AND
  (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

-- Add trigger for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create function to generate receipt number
CREATE OR REPLACE FUNCTION public.generate_receipt_number(p_school_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  receipt_num TEXT;
  counter INTEGER;
  year_suffix TEXT;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COUNT(*) + 1 INTO counter
  FROM public.payments
  WHERE school_id = p_school_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  receipt_num := 'REC' || year_suffix || LPAD(counter::TEXT, 6, '0');
  
  RETURN receipt_num;
END;
$$;
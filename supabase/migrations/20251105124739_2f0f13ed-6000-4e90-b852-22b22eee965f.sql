-- Create subscription types enum
CREATE TYPE public.subscription_type AS ENUM ('monthly', 'annual');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subscription_type subscription_type NOT NULL,
  status subscription_status NOT NULL DEFAULT 'pending',
  amount NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  transaction_reference TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "School admins can view their school subscription"
  ON public.subscriptions
  FOR SELECT
  USING (
    school_id = get_user_school(auth.uid()) 
    AND (has_role(auth.uid(), 'school_admin') OR has_role(auth.uid(), 'super_admin'))
  );

CREATE POLICY "Super admins can manage all subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add subscription_status to schools table
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS subscription_status subscription_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS subscription_end_date DATE;
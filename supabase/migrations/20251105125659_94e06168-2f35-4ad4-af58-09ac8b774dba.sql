-- Create table for Paytech configuration
CREATE TABLE IF NOT EXISTS public.paytech_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT,
  secret_key TEXT,
  api_url TEXT DEFAULT 'https://paytech.sn/api/payment/request-payment',
  cancel_url TEXT,
  success_url TEXT,
  ipn_url TEXT,
  currency TEXT DEFAULT 'XOF',
  env TEXT DEFAULT 'test',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.paytech_settings ENABLE ROW LEVEL SECURITY;

-- Only super_admins can manage Paytech settings
CREATE POLICY "Super admins can view Paytech settings"
  ON public.paytech_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can insert Paytech settings"
  ON public.paytech_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update Paytech settings"
  ON public.paytech_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_paytech_settings_updated_at
  BEFORE UPDATE ON public.paytech_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
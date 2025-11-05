-- Create table for reminder configurations
CREATE TABLE IF NOT EXISTS public.reminder_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('automatic', 'manual')),
  trigger_days INTEGER NOT NULL, -- Nombre de jours de retard avant déclenchement
  message_template TEXT NOT NULL,
  channels JSONB NOT NULL DEFAULT '["sms"]'::jsonb, -- sms, whatsapp, email
  is_active BOOLEAN NOT NULL DEFAULT true,
  send_to_parent BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for scheduled reminders
CREATE TABLE IF NOT EXISTS public.scheduled_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  message TEXT NOT NULL,
  channels JSONB NOT NULL DEFAULT '["sms"]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  send_to_parent BOOLEAN NOT NULL DEFAULT true,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for reminder history
CREATE TABLE IF NOT EXISTS public.reminder_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  reminder_type TEXT NOT NULL,
  message TEXT NOT NULL,
  channels JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT,
  sent_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminder_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reminder_configurations
CREATE POLICY "School admins can view their reminder configurations"
  ON public.reminder_configurations FOR SELECT
  USING (school_id = get_user_school(auth.uid()) AND (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "School admins can insert their reminder configurations"
  ON public.reminder_configurations FOR INSERT
  WITH CHECK (school_id = get_user_school(auth.uid()) AND (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "School admins can update their reminder configurations"
  ON public.reminder_configurations FOR UPDATE
  USING (school_id = get_user_school(auth.uid()) AND (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "School admins can delete their reminder configurations"
  ON public.reminder_configurations FOR DELETE
  USING (school_id = get_user_school(auth.uid()) AND (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

-- RLS Policies for scheduled_reminders
CREATE POLICY "School admins can view their scheduled reminders"
  ON public.scheduled_reminders FOR SELECT
  USING (school_id = get_user_school(auth.uid()) AND (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "School admins can insert their scheduled reminders"
  ON public.scheduled_reminders FOR INSERT
  WITH CHECK (school_id = get_user_school(auth.uid()) AND (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "School admins can update their scheduled reminders"
  ON public.scheduled_reminders FOR UPDATE
  USING (school_id = get_user_school(auth.uid()) AND (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "School admins can delete their scheduled reminders"
  ON public.scheduled_reminders FOR DELETE
  USING (school_id = get_user_school(auth.uid()) AND (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

-- RLS Policies for reminder_history
CREATE POLICY "School admins can view their reminder history"
  ON public.reminder_history FOR SELECT
  USING (school_id = get_user_school(auth.uid()) AND (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "School admins can insert reminder history"
  ON public.reminder_history FOR INSERT
  WITH CHECK (school_id = get_user_school(auth.uid()) AND (has_role(auth.uid(), 'school_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

-- Create triggers for updated_at
CREATE TRIGGER update_reminder_configurations_updated_at
  BEFORE UPDATE ON public.reminder_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_scheduled_reminders_updated_at
  BEFORE UPDATE ON public.scheduled_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
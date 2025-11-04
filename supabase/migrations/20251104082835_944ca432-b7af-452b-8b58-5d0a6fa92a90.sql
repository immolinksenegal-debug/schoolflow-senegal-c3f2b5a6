-- Add financial fields to classes table
ALTER TABLE public.classes
ADD COLUMN registration_fee NUMERIC DEFAULT 0,
ADD COLUMN monthly_tuition NUMERIC DEFAULT 0;

COMMENT ON COLUMN public.classes.registration_fee IS 'Montant des frais d''inscription pour cette classe';
COMMENT ON COLUMN public.classes.monthly_tuition IS 'Montant de la scolarité mensuelle pour cette classe';
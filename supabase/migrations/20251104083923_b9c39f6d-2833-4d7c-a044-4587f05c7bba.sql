-- Add annual tuition field to classes table
ALTER TABLE public.classes
ADD COLUMN annual_tuition NUMERIC DEFAULT 0;

COMMENT ON COLUMN public.classes.annual_tuition IS 'Montant de la scolarité annuelle pour cette classe';
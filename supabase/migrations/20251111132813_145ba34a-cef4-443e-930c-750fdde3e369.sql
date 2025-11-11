-- Supprimer l'ancienne contrainte
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_type_check;

-- Recréer la contrainte avec 'monthly_tuition' inclus
ALTER TABLE public.payments ADD CONSTRAINT payments_payment_type_check 
CHECK (payment_type = ANY (ARRAY[
  'tuition'::text, 
  'monthly_tuition'::text,
  'registration'::text, 
  'exam'::text, 
  'transport'::text, 
  'canteen'::text, 
  'uniform'::text, 
  'books'::text, 
  'other'::text
]));
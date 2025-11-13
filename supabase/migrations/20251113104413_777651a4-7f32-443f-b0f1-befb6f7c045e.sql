
-- Supprimer la contrainte d'unicité sur l'email des écoles
-- Car plusieurs écoles peuvent avoir le même email de contact
ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_email_unique;

-- Créer un index non-unique pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_schools_email ON public.schools(email) WHERE email IS NOT NULL;

-- Ajouter le champ study_months à la table classes
ALTER TABLE classes ADD COLUMN IF NOT EXISTS study_months integer DEFAULT 9;

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN classes.study_months IS 'Nombre de mois d''études pour calculer la scolarité annuelle';
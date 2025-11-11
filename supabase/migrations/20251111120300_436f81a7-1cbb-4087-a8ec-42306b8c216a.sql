-- Supprimer les contraintes UNIQUE sur les coordonnées des parents
-- pour permettre à un parent d'avoir plusieurs enfants dans l'établissement

ALTER TABLE students DROP CONSTRAINT IF EXISTS unique_parent_phone;
ALTER TABLE students DROP CONSTRAINT IF EXISTS unique_parent_email;

-- Créer des index normaux (non-uniques) pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON students(parent_phone) WHERE parent_phone IS NOT NULL AND parent_phone != '';
CREATE INDEX IF NOT EXISTS idx_students_parent_email ON students(parent_email) WHERE parent_email IS NOT NULL AND parent_email != '';
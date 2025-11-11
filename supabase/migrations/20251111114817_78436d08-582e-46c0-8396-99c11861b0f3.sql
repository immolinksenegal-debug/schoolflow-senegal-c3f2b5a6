-- Retirer les contraintes uniques sur les coordonnées des parents
-- pour permettre à un parent d'avoir plusieurs enfants dans l'établissement

-- Supprimer l'index unique sur parent_phone
DROP INDEX IF EXISTS students_parent_phone_unique;

-- Supprimer l'index unique sur parent_email  
DROP INDEX IF EXISTS students_parent_email_unique;

-- Créer des index normaux (non-uniques) pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON students(parent_phone) WHERE parent_phone IS NOT NULL AND parent_phone != '';
CREATE INDEX IF NOT EXISTS idx_students_parent_email ON students(parent_email) WHERE parent_email IS NOT NULL AND parent_email != '';
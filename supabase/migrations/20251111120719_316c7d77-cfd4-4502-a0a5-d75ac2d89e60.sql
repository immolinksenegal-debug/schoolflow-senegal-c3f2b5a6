-- Supprimer TOUTES les contraintes uniques sur parent_phone et parent_email
-- Rechercher et supprimer les contraintes avec différents noms possibles

DO $$ 
DECLARE
    constraint_record RECORD;
BEGIN
    -- Supprimer toutes les contraintes UNIQUE sur parent_phone
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'students' 
        AND table_schema = 'public'
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%parent_phone%'
    LOOP
        EXECUTE 'ALTER TABLE students DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    END LOOP;
    
    -- Supprimer toutes les contraintes UNIQUE sur parent_email
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'students' 
        AND table_schema = 'public'
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%parent_email%'
    LOOP
        EXECUTE 'ALTER TABLE students DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- Supprimer aussi les index uniques potentiels
DROP INDEX IF EXISTS students_parent_phone_unique;
DROP INDEX IF EXISTS students_parent_email_unique;
DROP INDEX IF EXISTS unique_parent_phone;
DROP INDEX IF EXISTS unique_parent_email;

-- Créer des index normaux pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON students(parent_phone) WHERE parent_phone IS NOT NULL AND parent_phone != '';
CREATE INDEX IF NOT EXISTS idx_students_parent_email ON students(parent_email) WHERE parent_email IS NOT NULL AND parent_email != '';
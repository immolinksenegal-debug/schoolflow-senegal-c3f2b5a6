
-- Créer le profil et le rôle super_admin pour georgesbiramendiaye@gmail.com
-- Note: L'utilisateur devra d'abord créer son compte via l'interface de signup

-- Insérer le rôle super_admin pour l'utilisateur avec cet email
-- On utilise une fonction pour s'assurer que ça fonctionne même si l'utilisateur n'existe pas encore
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Chercher l'utilisateur par email
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'georgesbiramendiaye@gmail.com';
  
  -- Si l'utilisateur existe déjà, lui attribuer le rôle super_admin
  IF v_user_id IS NOT NULL THEN
    -- Supprimer les rôles existants pour éviter les doublons
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    
    -- Ajouter le rôle super_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin');
    
    RAISE NOTICE 'Rôle super_admin attribué à l''utilisateur existant';
  ELSE
    RAISE NOTICE 'Utilisateur non trouvé. Veuillez d''abord créer un compte avec cet email via la page d''inscription';
  END IF;
END $$;

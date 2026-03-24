-- 003_security_and_cleanup.sql
-- 1. Create User Deletion RPC (Security Definer)
-- Allows users to securely delete their own accounts
CREATE OR REPLACE FUNCTION public.delete_user_self()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure Admin Table exists and initial admin is set
INSERT INTO public.admin_users (user_id, email, role)
SELECT id, email, 'admin' FROM auth.users 
WHERE email = 'abdelbadie.kertimi1212@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

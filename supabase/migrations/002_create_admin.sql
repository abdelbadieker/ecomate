-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR AFTER SETUP
-- Creates the admin account for Abdelbadie
-- ============================================================

-- Step 1: First, sign up via the website at /auth/register
-- Use email: abdelbadie.kertimi1212@gmail.com
-- Password: 12345678 (change it after first login!)

-- Step 2: After signing up, run this SQL to grant admin role:
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'abdelbadie.kertimi1212@gmail.com'
  LIMIT 1
);

-- Verify:
SELECT id, full_name, role FROM public.profiles
WHERE role = 'admin';

-- ============================================================
-- ALTERNATIVE: Create admin directly without signup
-- (Replace YOUR_ADMIN_UUID with the actual user ID from auth.users)
-- ============================================================
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_ADMIN_UUID';

-- SQL script to create superadmin user
-- This needs to be run with service role permissions or via Supabase dashboard
-- OR use the Node.js script instead: npx tsx scripts/create-superadmin.ts

-- Step 1: Create the user in auth.users (requires service role)
-- This needs to be done via Supabase Admin API or Dashboard
-- 
-- After creating the user via API/dashboard, run this to create/update the profile:

-- Replace 'USER_ID_FROM_AUTH' with the actual user ID from auth.users
-- Example: INSERT INTO profiles (id, email, full_name, role, department_id, is_active)
-- VALUES (
--   'USER_ID_FROM_AUTH',
--   'superadmin@test.com',
--   'Super Admin',
--   'superadmin',
--   (SELECT id FROM departments WHERE code = 'HR' LIMIT 1),
--   true
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   email = EXCLUDED.email,
--   full_name = EXCLUDED.full_name,
--   role = 'superadmin',
--   department_id = EXCLUDED.department_id,
--   is_active = true;

-- Note: Use the Node.js script instead for easier setup


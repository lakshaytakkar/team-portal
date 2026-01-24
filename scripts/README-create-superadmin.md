# Creating Superadmin User

To create a superadmin user for testing, you have three options:

## Option 1: Using the JavaScript Script (Recommended - No TypeScript Required)

1. Make sure you have `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` file
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   You can find the service role key in: Supabase Dashboard → Settings → API → service_role key

2. Run the script (no additional dependencies needed - uses already installed @supabase/supabase-js):
   ```bash
   node scripts/create-superadmin.js
   ```

This will create:
- **Email**: superadmin@test.com
- **Password**: superadmin123
- **Role**: superadmin
- **Department**: HR (or first available department)

## Option 2: Using the TypeScript Script

1. Make sure you have `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` file
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. Install dependencies if needed:
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

3. Run the script:
   ```bash
   npx tsx scripts/create-superadmin.ts
   ```

This will create:
- **Email**: superadmin@test.com
- **Password**: superadmin123
- **Role**: superadmin
- **Department**: HR (or first available department)

## Option 2: Using Supabase Dashboard

1. Go to your Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter:
   - Email: `superadmin@test.com`
   - Password: `superadmin123`
   - Auto Confirm User: ✓ (checked)
4. After creating the user, copy the User ID (UUID)
5. Run this SQL in the SQL Editor:

```sql
INSERT INTO profiles (id, email, full_name, role, department_id, is_active)
VALUES (
  'USER_ID_FROM_STEP_4',  -- Replace with actual UUID
  'superadmin@test.com',
  'Super Admin',
  'superadmin',
  (SELECT id FROM departments WHERE code = 'HR' LIMIT 1),
  true
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = 'superadmin',
  department_id = EXCLUDED.department_id,
  is_active = true;
```

## Option 3: Manual SQL (If you have service role access)

If you have direct database access with service role permissions, you can create the user directly via SQL, but this is not recommended as it bypasses Supabase's auth system.

## After Creation

Once created, you can log in at `/sign-in` with:
- Email: `superadmin@test.com`
- Password: `superadmin123`


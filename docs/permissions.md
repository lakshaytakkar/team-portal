# Permission Matrix & RLS Plan

This document defines the role-based access control (RBAC) system and maps capabilities to Row Level Security (RLS) policies in Supabase.

## Roles

1. **executive**: Standard user, focuses on own work
2. **manager**: Can manage team members' work
3. **superadmin**: Full system access

## Capability Matrix

### Projects

| Capability | Executive | Manager | SuperAdmin |
|------------|-----------|---------|------------|
| View own projects | ✅ | ✅ | ✅ |
| View team projects | ❌ | ✅ | ✅ |
| View all projects | ❌ | ❌ | ✅ |
| Create project | ❌ | ✅ | ✅ |
| Edit own project | ✅ | ✅ | ✅ |
| Edit team project | ❌ | ✅ | ✅ |
| Edit any project | ❌ | ❌ | ✅ |
| Delete project | ❌ | ❌ | ✅ |
| Assign team members | ❌ | ✅ | ✅ |

### Tasks

| Capability | Executive | Manager | SuperAdmin |
|------------|-----------|---------|------------|
| View own tasks | ✅ | ✅ | ✅ |
| View team tasks | ❌ | ✅ | ✅ |
| View all tasks | ❌ | ❌ | ✅ |
| Create task | ❌ | ✅ | ✅ |
| Edit own task | ✅ | ✅ | ✅ |
| Edit team task | ❌ | ✅ | ✅ |
| Edit any task | ❌ | ❌ | ✅ |
| Delete task | ❌ | ❌ | ✅ |
| Assign task | ❌ | ✅ | ✅ |
| Update task status | ✅ (own) | ✅ (team + own) | ✅ (all) |

### Calls

| Capability | Executive | Manager | SuperAdmin |
|------------|-----------|---------|------------|
| View own calls | ✅ | ✅ | ✅ |
| View team calls | ❌ | ✅ | ✅ |
| View all calls | ❌ | ❌ | ✅ |
| Create call | ✅ (self only) | ✅ (can assign) | ✅ (can assign) |
| Edit own call | ✅ | ✅ | ✅ |
| Edit team call | ❌ | ✅ | ✅ |
| Edit any call | ❌ | ❌ | ✅ |
| Delete call | ✅ (own) | ✅ (team + own) | ✅ (all) |

### Attendance

| Capability | Executive | Manager | SuperAdmin |
|------------|-----------|---------|------------|
| View own attendance | ✅ | ✅ | ✅ |
| View team attendance | ❌ | ✅ | ✅ |
| View all attendance | ❌ | ❌ | ✅ |
| Check in/out | ✅ (self) | ✅ (self) | ✅ (self) |
| Request correction | ✅ (own) | ✅ (own) | ✅ (own) |
| Approve correction | ❌ | ✅ | ✅ |
| Edit attendance | ❌ | ❌ | ✅ |

### Users & Admin

| Capability | Executive | Manager | SuperAdmin |
|------------|-----------|---------|------------|
| View own profile | ✅ | ✅ | ✅ |
| View team profiles | ❌ | ✅ | ✅ |
| View all profiles | ❌ | ❌ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |
| Edit team profiles | ❌ | ❌ | ✅ |
| Edit any profile | ❌ | ❌ | ✅ |
| Assign roles | ❌ | ❌ | ✅ |
| Manage permissions | ❌ | ❌ | ✅ |

## RLS Policies

### Helper Functions

```sql
-- Check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT role = 'superadmin' FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is manager
CREATE OR REPLACE FUNCTION is_manager(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT role IN ('manager', 'superadmin') FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Get user's manager (for team queries)
CREATE OR REPLACE FUNCTION get_user_manager(user_id UUID)
RETURNS UUID AS $$
  SELECT manager_id FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user manages target user
CREATE OR REPLACE FUNCTION manages_user(manager_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = target_user_id 
    AND manager_id = manages_user.manager_id
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Get team member IDs (direct reports)
CREATE OR REPLACE FUNCTION get_team_members(manager_id UUID)
RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(id) FROM profiles WHERE manager_id = get_team_members.manager_id;
$$ LANGUAGE sql SECURITY DEFINER;
```

### Projects RLS

```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- SuperAdmin can view all
CREATE POLICY "SuperAdmin can view all projects"
  ON projects FOR SELECT
  USING (is_superadmin(auth.uid()));

-- Manager can view own + team projects
CREATE POLICY "Manager can view team projects"
  ON projects FOR SELECT
  USING (
    is_manager(auth.uid()) AND (
      owner_id = auth.uid() OR
      owner_id IN (SELECT id FROM profiles WHERE manager_id = auth.uid())
    )
  );

-- Executive can view own projects
CREATE POLICY "Executive can view own projects"
  ON projects FOR SELECT
  USING (owner_id = auth.uid());

-- SuperAdmin can insert/update/delete all
CREATE POLICY "SuperAdmin can manage all projects"
  ON projects FOR ALL
  USING (is_superadmin(auth.uid()));

-- Manager can insert projects
CREATE POLICY "Manager can create projects"
  ON projects FOR INSERT
  WITH CHECK (is_manager(auth.uid()));

-- Manager can update own + team projects
CREATE POLICY "Manager can update team projects"
  ON projects FOR UPDATE
  USING (
    is_manager(auth.uid()) AND (
      owner_id = auth.uid() OR
      owner_id IN (SELECT id FROM profiles WHERE manager_id = auth.uid())
    )
  );

-- Executive can update own projects
CREATE POLICY "Executive can update own projects"
  ON projects FOR UPDATE
  USING (owner_id = auth.uid());
```

### Tasks RLS

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SuperAdmin can view all
CREATE POLICY "SuperAdmin can view all tasks"
  ON tasks FOR SELECT
  USING (is_superadmin(auth.uid()) AND deleted_at IS NULL);

-- Manager can view own + team tasks
CREATE POLICY "Manager can view team tasks"
  ON tasks FOR SELECT
  USING (
    is_manager(auth.uid()) AND deleted_at IS NULL AND (
      assigned_to = auth.uid() OR
      assigned_to IN (SELECT id FROM profiles WHERE manager_id = auth.uid()) OR
      project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid() OR owner_id IN (SELECT id FROM profiles WHERE manager_id = auth.uid()))
    )
  );

-- Executive can view own tasks
CREATE POLICY "Executive can view own tasks"
  ON tasks FOR SELECT
  USING (assigned_to = auth.uid() AND deleted_at IS NULL);

-- SuperAdmin can manage all
CREATE POLICY "SuperAdmin can manage all tasks"
  ON tasks FOR ALL
  USING (is_superadmin(auth.uid()));

-- Manager can create/update tasks
CREATE POLICY "Manager can manage tasks"
  ON tasks FOR ALL
  USING (
    is_manager(auth.uid()) AND (
      assigned_to = auth.uid() OR
      assigned_to IN (SELECT id FROM profiles WHERE manager_id = auth.uid()) OR
      project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid() OR owner_id IN (SELECT id FROM profiles WHERE manager_id = auth.uid()))
    )
  );

-- Executive can update own tasks
CREATE POLICY "Executive can update own tasks"
  ON tasks FOR UPDATE
  USING (assigned_to = auth.uid());
```

### Calls RLS

```sql
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- SuperAdmin can view all
CREATE POLICY "SuperAdmin can view all calls"
  ON calls FOR SELECT
  USING (is_superadmin(auth.uid()) AND deleted_at IS NULL);

-- Manager can view own + team calls
CREATE POLICY "Manager can view team calls"
  ON calls FOR SELECT
  USING (
    is_manager(auth.uid()) AND deleted_at IS NULL AND (
      assigned_to = auth.uid() OR
      assigned_to IN (SELECT id FROM profiles WHERE manager_id = auth.uid())
    )
  );

-- Executive can view own calls
CREATE POLICY "Executive can view own calls"
  ON calls FOR SELECT
  USING (assigned_to = auth.uid() AND deleted_at IS NULL);

-- All can create calls
CREATE POLICY "Users can create calls"
  ON calls FOR INSERT
  WITH CHECK (
    assigned_to = auth.uid() OR -- Can create for self
    is_manager(auth.uid()) -- Manager can assign to team
  );

-- SuperAdmin can manage all
CREATE POLICY "SuperAdmin can manage all calls"
  ON calls FOR ALL
  USING (is_superadmin(auth.uid()));

-- Manager can update team calls
CREATE POLICY "Manager can update team calls"
  ON calls FOR UPDATE
  USING (
    is_manager(auth.uid()) AND (
      assigned_to = auth.uid() OR
      assigned_to IN (SELECT id FROM profiles WHERE manager_id = auth.uid())
    )
  );

-- Executive can update own calls
CREATE POLICY "Executive can update own calls"
  ON calls FOR UPDATE
  USING (assigned_to = auth.uid());
```

### Attendance RLS

```sql
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- SuperAdmin can view all
CREATE POLICY "SuperAdmin can view all attendance"
  ON attendance FOR SELECT
  USING (is_superadmin(auth.uid()));

-- Manager can view team attendance
CREATE POLICY "Manager can view team attendance"
  ON attendance FOR SELECT
  USING (
    is_manager(auth.uid()) AND (
      user_id = auth.uid() OR
      user_id IN (SELECT id FROM profiles WHERE manager_id = auth.uid())
    )
  );

-- Executive can view own attendance
CREATE POLICY "Executive can view own attendance"
  ON attendance FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert own attendance (check-in)
CREATE POLICY "Users can create own attendance"
  ON attendance FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update own attendance (check-out)
CREATE POLICY "Users can update own attendance"
  ON attendance FOR UPDATE
  USING (user_id = auth.uid());

-- SuperAdmin can manage all
CREATE POLICY "SuperAdmin can manage all attendance"
  ON attendance FOR ALL
  USING (is_superadmin(auth.uid()));
```

### Profiles RLS

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Manager can view team profiles
CREATE POLICY "Manager can view team profiles"
  ON profiles FOR SELECT
  USING (
    is_manager(auth.uid()) AND (
      id = auth.uid() OR
      manager_id = auth.uid()
    )
  );

-- SuperAdmin can view all profiles
CREATE POLICY "SuperAdmin can view all profiles"
  ON profiles FOR SELECT
  USING (is_superadmin(auth.uid()));

-- Users can update own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    -- Prevent role changes (only superadmin can change roles)
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- SuperAdmin can manage all profiles
CREATE POLICY "SuperAdmin can manage all profiles"
  ON profiles FOR ALL
  USING (is_superadmin(auth.uid()));
```

## UI-Level Permission Checks

In addition to RLS, implement UI-level checks using helper functions:

```typescript
// lib/utils/permissions.ts
export function canViewAllProjects(role: string): boolean {
  return role === 'superadmin'
}

export function canCreateProject(role: string): boolean {
  return role === 'manager' || role === 'superadmin'
}

export function canEditProject(role: string, projectOwnerId: string, currentUserId: string): boolean {
  if (role === 'superadmin') return true
  if (role === 'manager') return true // Manager can edit team projects (RLS will enforce)
  return projectOwnerId === currentUserId
}

// Similar functions for tasks, calls, attendance
```

## Testing RLS

Create test queries to verify RLS policies:

```sql
-- Test as Executive
SET ROLE authenticated;
SET request.jwt.claim.sub = 'executive-user-id';

-- Should only see own projects
SELECT * FROM projects;

-- Test as Manager
SET request.jwt.claim.sub = 'manager-user-id';

-- Should see own + team projects
SELECT * FROM projects;

-- Test as SuperAdmin
SET request.jwt.claim.sub = 'superadmin-user-id';

-- Should see all projects
SELECT * FROM projects;
```

## Implementation Order

1. Create helper functions
2. Enable RLS on all tables
3. Create SELECT policies (read access)
4. Create INSERT policies (create access)
5. Create UPDATE policies (edit access)
6. Create DELETE policies (delete access)
7. Test with different roles
8. Implement UI-level permission checks
9. Document edge cases


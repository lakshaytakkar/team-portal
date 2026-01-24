# Data Model Specification

This document defines the Supabase database schema for the Internal Team Portal. This schema will be implemented after the UI is stable and we've validated the data requirements through page specs.

## Design Principles

1. **Audit Fields**: All tables include `created_at`, `updated_at`, `created_by`, `updated_by`
2. **Soft Deletes**: Use `deleted_at` timestamp instead of hard deletes (where applicable)
3. **RLS Ready**: All tables designed with Row Level Security in mind
4. **Indexes**: Define indexes for common query patterns
5. **Foreign Keys**: Use foreign keys for referential integrity

## Core Tables

### users (extends Supabase Auth)
Supabase Auth provides the base user table. We'll add a `profiles` table for additional user data.

```sql
-- profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'executive', -- 'executive', 'manager', 'superadmin'
  department TEXT,
  manager_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_manager ON profiles(manager_id);
CREATE INDEX idx_profiles_active ON profiles(is_active);
```

### projects
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning', -- 'planning', 'active', 'on-hold', 'completed', 'cancelled'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  end_date DATE,
  due_date DATE,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_due_date ON projects(due_date);
CREATE INDEX idx_projects_deleted ON projects(deleted_at) WHERE deleted_at IS NULL;
```

### project_members
```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'member', 'viewer'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
```

### tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'not-started', -- 'not-started', 'in-progress', 'in-review', 'completed', 'blocked'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  level INTEGER DEFAULT 0 CHECK (level IN (0, 1, 2)), -- 0 = top-level, 1 = subtask, 2 = sub-subtask
  parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id),
  due_date DATE,
  figma_link TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_deleted ON tasks(deleted_at) WHERE deleted_at IS NULL;
```

### calls
```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time TIME NOT NULL,
  contact_name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  outcome TEXT, -- 'connected', 'voicemail', 'no-answer', 'busy', 'callback-requested', 'not-interested', 'interested', 'meeting-scheduled'
  notes TEXT,
  next_action TEXT,
  next_action_date DATE,
  assigned_to UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'rescheduled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_calls_date ON calls(date);
CREATE INDEX idx_calls_assigned_to ON calls(assigned_to);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_outcome ON calls(outcome);
CREATE INDEX idx_calls_deleted ON calls(deleted_at) WHERE deleted_at IS NULL;
```

### attendance
```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  date DATE NOT NULL,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  status TEXT DEFAULT 'present', -- 'present', 'absent', 'late', 'half-day', 'leave'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_user_date ON attendance(user_id, date);
```

### attendance_corrections
```sql
CREATE TABLE attendance_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id),
  requested_date DATE NOT NULL,
  requested_check_in TIMESTAMPTZ,
  requested_check_out TIMESTAMPTZ,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attendance_corrections_status ON attendance_corrections(status);
CREATE INDEX idx_attendance_corrections_requested_by ON attendance_corrections(requested_by);
CREATE INDEX idx_attendance_corrections_reviewed_by ON attendance_corrections(reviewed_by);
```

## Views (for common queries)

### project_stats_view
```sql
CREATE VIEW project_stats_view AS
SELECT 
  p.id,
  p.name,
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
  COUNT(DISTINCT pm.user_id) as team_size
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id AND t.deleted_at IS NULL
LEFT JOIN project_members pm ON pm.project_id = p.id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.name;
```

### user_task_summary_view
```sql
CREATE VIEW user_task_summary_view AS
SELECT 
  assigned_to as user_id,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_count,
  COUNT(*) FILTER (WHERE status = 'not-started') as not_started_count,
  COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status != 'completed') as overdue_count
FROM tasks
WHERE deleted_at IS NULL
GROUP BY assigned_to;
```

## Functions & Triggers

### update_updated_at()
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Apply trigger to all tables
```sql
-- Example for projects table
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Repeat for: tasks, calls, attendance, attendance_corrections, profiles
```

## Sample Data Strategy

Before implementing Supabase schema, we'll use:
- `lib/data/projects.ts` - Sample project data
- `lib/data/tasks.ts` - Sample task data
- `lib/data/calls.ts` - Sample call data (to be created)
- `lib/data/attendance.ts` - Sample attendance data (to be created)

These will be replaced with Supabase queries once schema is implemented.

## Migration Strategy

1. Create tables in order (respecting foreign key dependencies)
2. Add indexes
3. Create views
4. Set up triggers
5. Implement RLS policies (see `docs/permissions.md`)
6. Seed with sample data
7. Test queries and performance

## Notes

- All timestamps use `TIMESTAMPTZ` for timezone support
- UUIDs are used for all primary keys (Supabase default)
- Text fields use `TEXT` type (no length limits initially, can optimize later)
- Consider adding full-text search indexes for searchable fields (name, description, notes)

## Foreign Key Resolution Patterns

### Problem

When creating records that reference other tables via foreign keys, forms often send user-friendly identifiers (names, codes, emails) instead of UUIDs. Passing these directly to database operations causes foreign key constraint violations.

### Solution

Use the foreign key resolution utilities in `lib/utils/foreign-keys.ts` to convert user-friendly identifiers to UUIDs before database operations.

### Usage Examples

#### Resolving Department IDs

```typescript
import { resolveDepartmentId, normalizeOptional } from '@/lib/utils/foreign-keys'

// In a create/update action:
const departmentId = await resolveDepartmentId(input.departmentId, false) // false = optional field
// Returns: UUID string or null if not found and not required

// For required fields:
const requiredDeptId = await resolveDepartmentId(input.departmentId, true) // true = required
// Throws error if not found
```

#### Resolving Profile/Manager IDs

```typescript
import { resolveProfileId } from '@/lib/utils/foreign-keys'

// Resolve manager ID from email, name, or UUID:
const managerId = await resolveProfileId(input.managerId, false)
// Supports: UUID, email, or full name lookup
```

#### Normalizing Optional Fields

```typescript
import { normalizeOptional } from '@/lib/utils/foreign-keys'

// Convert empty strings to undefined for optional fields:
const phone = normalizeOptional(input.phone) // "" -> undefined
const position = normalizeOptional(input.position) // null -> undefined
```

#### Complete Example

```typescript
export async function createEmployee(input: CreateEmployeeInput) {
  try {
    // Normalize optional fields
    const phone = normalizeOptional(input.phone)
    const position = normalizeOptional(input.position)

    // Resolve foreign keys
    const departmentId = await resolveDepartmentId(input.departmentId, false)
    const managerId = await resolveProfileId(input.managerId, false)

    // Validate required fields
    if (!input.fullName || !input.email) {
      throw new Error('Full name and email are required')
    }

    // Create record with resolved UUIDs
    const [newProfile] = await db
      .insert(profiles)
      .values({
        email: input.email,
        fullName: input.fullName,
        phone,
        departmentId, // Now a UUID or null
        position,
        managerId, // Now a UUID or null
        // ...
      })
      .returning()

    // ...
  } catch (error) {
    logDatabaseError(error, 'createEmployee')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}
```

### Error Handling

Always wrap database operations in try-catch and use error utilities:

```typescript
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'

try {
  // Database operation
} catch (error) {
  logDatabaseError(error, 'context') // Logs for debugging
  const friendlyMessage = getUserFriendlyErrorMessage(error) // User-friendly message
  throw new Error(friendlyMessage)
}
```

### Best Practices

1. **Always resolve foreign keys** - Never pass string names/codes directly to foreign key fields
2. **Normalize optional fields** - Convert empty strings to `undefined` for optional fields
3. **Validate required fields** - Check required fields before database operations
4. **Use error handling** - Wrap all database operations in try-catch with user-friendly messages
5. **Use transactions** - For multi-table operations, use database transactions for atomicity


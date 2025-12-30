-- Migration: Add RLS policies for projects, goals, and calls tables
-- Enables Row Level Security with role-based access control

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROJECTS TABLE POLICIES
-- ============================================================================

-- Users can see projects where they are owner or member
CREATE POLICY "Users see own projects"
ON projects FOR SELECT
USING (
  owner_id = auth.uid()
  OR id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  )
);

-- Managers can see projects where they or their team members are owners/members
CREATE POLICY "Managers see team projects"
ON projects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('manager', 'superadmin')
  )
  AND (
    owner_id = auth.uid()
    OR owner_id IN (
      SELECT id FROM profiles WHERE manager_id = auth.uid()
    )
    OR id IN (
      SELECT pm.project_id FROM project_members pm
      WHERE pm.user_id = auth.uid()
      OR pm.user_id IN (
        SELECT id FROM profiles WHERE manager_id = auth.uid()
      )
    )
  )
);

-- Superadmin can see all projects
CREATE POLICY "Superadmin sees all projects"
ON projects FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);

-- Users can create projects (will be owner)
CREATE POLICY "Users can create projects"
ON projects FOR INSERT
WITH CHECK (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('manager', 'superadmin')
  )
);

-- Users can update projects they own
CREATE POLICY "Owners can update projects"
ON projects FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Managers can update projects owned by team members
CREATE POLICY "Managers can update team projects"
ON projects FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'manager'
  )
  AND owner_id IN (
    SELECT id FROM profiles WHERE manager_id = auth.uid()
  )
);

-- Superadmin can update any project
CREATE POLICY "Superadmin can update all projects"
ON projects FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);

-- Users can delete projects they own
CREATE POLICY "Owners can delete projects"
ON projects FOR DELETE
USING (owner_id = auth.uid());

-- Superadmin can delete any project
CREATE POLICY "Superadmin can delete all projects"
ON projects FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);

-- ============================================================================
-- PROJECT_MEMBERS TABLE POLICIES
-- ============================================================================

-- Users can see project members for projects they have access to
CREATE POLICY "Users see project members"
ON project_members FOR SELECT
USING (
  project_id IN (
    SELECT id FROM projects
    WHERE owner_id = auth.uid()
    OR id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('manager', 'superadmin')
  )
);

-- Project owners and managers can add members
CREATE POLICY "Project owners can add members"
ON project_members FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('manager', 'superadmin')
  )
);

-- Project owners can update members
CREATE POLICY "Project owners can update members"
ON project_members FOR UPDATE
USING (
  project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);

-- Project owners can remove members
CREATE POLICY "Project owners can remove members"
ON project_members FOR DELETE
USING (
  project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);

-- ============================================================================
-- GOALS TABLE POLICIES
-- ============================================================================

-- Users can see their own goals
CREATE POLICY "Users see own goals"
ON goals FOR SELECT
USING (user_id = auth.uid());

-- Managers can see goals of their team members
CREATE POLICY "Managers see team goals"
ON goals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('manager', 'superadmin')
  )
  AND user_id IN (
    SELECT id FROM profiles WHERE manager_id = auth.uid()
  )
);

-- Superadmin can see all goals
CREATE POLICY "Superadmin sees all goals"
ON goals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);

-- Users can create their own goals
CREATE POLICY "Users can create own goals"
ON goals FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own goals
CREATE POLICY "Users can update own goals"
ON goals FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Managers can update team member goals
CREATE POLICY "Managers can update team goals"
ON goals FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'manager'
  )
  AND user_id IN (
    SELECT id FROM profiles WHERE manager_id = auth.uid()
  )
);

-- Users can delete their own goals
CREATE POLICY "Users can delete own goals"
ON goals FOR DELETE
USING (user_id = auth.uid());

-- Superadmin can delete any goal
CREATE POLICY "Superadmin can delete all goals"
ON goals FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);

-- ============================================================================
-- CALLS TABLE POLICIES
-- ============================================================================

-- Users can see calls assigned to them
CREATE POLICY "Users see own calls"
ON calls FOR SELECT
USING (assigned_to_id = auth.uid());

-- Managers can see calls assigned to team members
CREATE POLICY "Managers see team calls"
ON calls FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('manager', 'superadmin')
  )
  AND assigned_to_id IN (
    SELECT id FROM profiles WHERE manager_id = auth.uid()
  )
);

-- Superadmin can see all calls
CREATE POLICY "Superadmin sees all calls"
ON calls FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);

-- Users can create calls assigned to them
CREATE POLICY "Users can create own calls"
ON calls FOR INSERT
WITH CHECK (assigned_to_id = auth.uid());

-- Managers can create calls for team members
CREATE POLICY "Managers can create team calls"
ON calls FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('manager', 'superadmin')
  )
  AND assigned_to_id IN (
    SELECT id FROM profiles WHERE manager_id = auth.uid()
    UNION
    SELECT auth.uid()
  )
);

-- Users can update calls assigned to them
CREATE POLICY "Users can update own calls"
ON calls FOR UPDATE
USING (assigned_to_id = auth.uid())
WITH CHECK (assigned_to_id = auth.uid());

-- Managers can update team calls
CREATE POLICY "Managers can update team calls"
ON calls FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'manager'
  )
  AND assigned_to_id IN (
    SELECT id FROM profiles WHERE manager_id = auth.uid()
  )
);

-- Users can delete calls assigned to them
CREATE POLICY "Users can delete own calls"
ON calls FOR DELETE
USING (assigned_to_id = auth.uid());

-- Superadmin can delete any call
CREATE POLICY "Superadmin can delete all calls"
ON calls FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);


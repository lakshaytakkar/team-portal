-- Migration: Create RLS policies for superadmin and executives
-- Focus: Superadmin has full access, executives have own data + read-only shared data
-- Manager policies will be added in a later phase

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access to all profiles
CREATE POLICY "superadmin_all_profiles"
ON profiles FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own profile
CREATE POLICY "executive_view_own_profile"
ON profiles FOR SELECT
USING (id = auth.uid());

-- Executives: Can update own profile (limited - no role changes)
CREATE POLICY "executive_update_own_profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() 
  AND role = (SELECT role FROM profiles WHERE id = auth.uid())
);

-- ============================================================================
-- EMPLOYEES TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_employees"
ON employees FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own employee record (via profile relationship)
CREATE POLICY "executive_view_own_employee"
ON employees FOR SELECT
USING (profile_id = auth.uid());

-- ============================================================================
-- DEPARTMENTS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_departments"
ON departments FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to all departments
CREATE POLICY "executive_read_departments"
ON departments FOR SELECT
USING (true);

-- ============================================================================
-- EMPLOYEE_DEPARTMENTS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_employee_departments"
ON employee_departments FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own department assignments
CREATE POLICY "executive_view_own_employee_departments"
ON employee_departments FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees 
    WHERE profile_id = auth.uid()
  )
);

-- ============================================================================
-- TASKS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_tasks"
ON tasks FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view tasks assigned to them
CREATE POLICY "executive_view_assigned_tasks"
ON tasks FOR SELECT
USING (assigned_to_id = auth.uid() AND (deleted_at IS NULL));

-- Executives: Can update tasks assigned to them
CREATE POLICY "executive_update_assigned_tasks"
ON tasks FOR UPDATE
USING (assigned_to_id = auth.uid() AND (deleted_at IS NULL))
WITH CHECK (assigned_to_id = auth.uid());

-- ============================================================================
-- ATTENDANCE TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_attendance"
ON attendance FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own attendance
CREATE POLICY "executive_view_own_attendance"
ON attendance FOR SELECT
USING (user_id = auth.uid());

-- Executives: Can create own attendance records
CREATE POLICY "executive_create_own_attendance"
ON attendance FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Executives: Can update own attendance records
CREATE POLICY "executive_update_own_attendance"
ON attendance FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- ATTENDANCE_CORRECTIONS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_attendance_corrections"
ON attendance_corrections FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own correction requests
CREATE POLICY "executive_view_own_attendance_corrections"
ON attendance_corrections FOR SELECT
USING (requested_by_id = auth.uid());

-- Executives: Can create own correction requests
CREATE POLICY "executive_create_own_attendance_corrections"
ON attendance_corrections FOR INSERT
WITH CHECK (requested_by_id = auth.uid());

-- ============================================================================
-- LEAVE_REQUESTS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_leave_requests"
ON leave_requests FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own leave requests
CREATE POLICY "executive_view_own_leave_requests"
ON leave_requests FOR SELECT
USING (user_id = auth.uid());

-- Executives: Can create own leave requests
CREATE POLICY "executive_create_own_leave_requests"
ON leave_requests FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Executives: Can update own pending leave requests
CREATE POLICY "executive_update_own_leave_requests"
ON leave_requests FOR UPDATE
USING (user_id = auth.uid() AND status::text = 'pending')
WITH CHECK (user_id = auth.uid() AND status::text = 'pending');

-- ============================================================================
-- HR_TEMPLATES TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_hr_templates"
ON hr_templates FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to active templates
CREATE POLICY "executive_read_active_hr_templates"
ON hr_templates FOR SELECT
USING (is_active = true AND deleted_at IS NULL);

-- ============================================================================
-- DAILY_REPORTS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_daily_reports"
ON daily_reports FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own daily reports
CREATE POLICY "executive_view_own_daily_reports"
ON daily_reports FOR SELECT
USING (user_id = auth.uid());

-- Executives: Can create own daily reports
CREATE POLICY "executive_create_own_daily_reports"
ON daily_reports FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Executives: Can update own daily reports
CREATE POLICY "executive_update_own_daily_reports"
ON daily_reports FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRAININGS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_trainings"
ON trainings FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own training records
CREATE POLICY "executive_view_own_trainings"
ON trainings FOR SELECT
USING (user_id = auth.uid());

-- Executives: Can update own training records (e.g., mark as completed)
CREATE POLICY "executive_update_own_trainings"
ON trainings FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- KNOWLEDGE_BASE_ARTICLES TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_knowledge_base_articles"
ON knowledge_base_articles FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to published articles
CREATE POLICY "executive_read_published_articles"
ON knowledge_base_articles FOR SELECT
USING (
  is_published = true 
  OR created_by_id = auth.uid()
);

-- ============================================================================
-- PERSONAL_DOCUMENTS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_personal_documents"
ON personal_documents FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own personal documents
CREATE POLICY "executive_view_own_personal_documents"
ON personal_documents FOR SELECT
USING (user_id = auth.uid());

-- Executives: Can create own personal documents
CREATE POLICY "executive_create_own_personal_documents"
ON personal_documents FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Executives: Can update own personal documents
CREATE POLICY "executive_update_own_personal_documents"
ON personal_documents FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- PERSONAL_NOTES TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_personal_notes"
ON personal_notes FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own notes
CREATE POLICY "executive_view_own_personal_notes"
ON personal_notes FOR SELECT
USING (user_id = auth.uid());

-- Executives: Can create own notes
CREATE POLICY "executive_create_own_personal_notes"
ON personal_notes FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Executives: Can update own notes
CREATE POLICY "executive_update_own_personal_notes"
ON personal_notes FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Executives: Can delete own notes
CREATE POLICY "executive_delete_own_personal_notes"
ON personal_notes FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- MEETING_NOTES TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_meeting_notes"
ON meeting_notes FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own meeting notes
CREATE POLICY "executive_view_own_meeting_notes"
ON meeting_notes FOR SELECT
USING (user_id = auth.uid() OR created_by = auth.uid());

-- Executives: Can create own meeting notes
CREATE POLICY "executive_create_own_meeting_notes"
ON meeting_notes FOR INSERT
WITH CHECK (user_id = auth.uid() OR created_by = auth.uid());

-- Executives: Can update own meeting notes
CREATE POLICY "executive_update_own_meeting_notes"
ON meeting_notes FOR UPDATE
USING (user_id = auth.uid() OR created_by = auth.uid())
WITH CHECK (user_id = auth.uid() OR created_by = auth.uid());

-- ============================================================================
-- APPLICATIONS TABLE POLICIES (Recruitment)
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_applications"
ON applications FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own applications (if they apply for jobs)
CREATE POLICY "executive_view_own_applications"
ON applications FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
  OR created_by = auth.uid()
);

-- Executives: Can create own applications
CREATE POLICY "executive_create_own_applications"
ON applications FOR INSERT
WITH CHECK (created_by = auth.uid());

-- ============================================================================
-- CANDIDATES TABLE POLICIES (Superadmin/HR only)
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_candidates"
ON candidates FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: No access (superadmin/HR only)

-- ============================================================================
-- INTERVIEWS TABLE POLICIES (Superadmin/HR only)
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_interviews"
ON interviews FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: No access (superadmin/HR only)

-- ============================================================================
-- EVALUATIONS TABLE POLICIES (Superadmin/HR only)
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_evaluations"
ON evaluations FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: No access (superadmin/HR only)

-- ============================================================================
-- EVALUATION_ROUNDS TABLE POLICIES (Superadmin/HR only)
-- ============================================================================
-- Note: Table may not exist, policy created conditionally below

-- ============================================================================
-- JOB_POSTINGS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_job_postings"
ON job_postings FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to active job postings
CREATE POLICY "executive_read_active_job_postings"
ON job_postings FOR SELECT
USING (status = 'active' OR status = 'published');

-- ============================================================================
-- JOB_ROLES TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_job_roles"
ON job_roles FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to all job roles
CREATE POLICY "executive_read_job_roles"
ON job_roles FOR SELECT
USING (true);

-- ============================================================================
-- JOB_PORTALS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_job_portals"
ON job_portals FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to all job portals
CREATE POLICY "executive_read_job_portals"
ON job_portals FOR SELECT
USING (true);

-- ============================================================================
-- JOB_LISTINGS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_job_listings"
ON job_listings FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to active job listings
CREATE POLICY "executive_read_active_job_listings"
ON job_listings FOR SELECT
USING (status = 'active' AND deleted_at IS NULL);

-- ============================================================================
-- RECRUITMENT_CALLS TABLE POLICIES (Superadmin/HR only)
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_recruitment_calls"
ON recruitment_calls FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: No access (superadmin/HR only)

-- ============================================================================
-- ONBOARDINGS TABLE POLICIES (Superadmin/HR only)
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_onboardings"
ON onboardings FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: No access (superadmin/HR only)

-- ============================================================================
-- ONBOARDING_TASKS TABLE POLICIES (Superadmin/HR only)
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_onboarding_tasks"
ON onboarding_tasks FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: No access (superadmin/HR only)

-- ============================================================================
-- ASSETS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_assets"
ON assets FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to all assets
CREATE POLICY "executive_read_assets"
ON assets FOR SELECT
USING (deleted_at IS NULL);

-- ============================================================================
-- ASSET_TYPES TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_asset_types"
ON asset_types FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to all asset types
CREATE POLICY "executive_read_asset_types"
ON asset_types FOR SELECT
USING (true);

-- ============================================================================
-- ASSET_ASSIGNMENTS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_asset_assignments"
ON asset_assignments FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own asset assignments
CREATE POLICY "executive_view_own_asset_assignments"
ON asset_assignments FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees 
    WHERE profile_id = auth.uid()
  )
);

-- ============================================================================
-- DOCUMENT_COLLECTIONS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_document_collections"
ON document_collections FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to all document collections
CREATE POLICY "executive_read_document_collections"
ON document_collections FOR SELECT
USING (is_active = true);

-- ============================================================================
-- DOCUMENT_TYPES TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_document_types"
ON document_types FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to all document types
CREATE POLICY "executive_read_document_types"
ON document_types FOR SELECT
USING (true);

-- ============================================================================
-- EMPLOYEE_DOCUMENTS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_employee_documents"
ON employee_documents FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own employee documents
CREATE POLICY "executive_view_own_employee_documents"
ON employee_documents FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees 
    WHERE profile_id = auth.uid()
  )
);

-- ============================================================================
-- VERTICALS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_verticals"
ON verticals FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to all verticals
CREATE POLICY "executive_read_verticals"
ON verticals FOR SELECT
USING (is_active = true AND deleted_at IS NULL);

-- ============================================================================
-- ROLES TABLE POLICIES (Organizational roles, not permission roles)
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_roles"
ON roles FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to all organizational roles
CREATE POLICY "executive_read_roles"
ON roles FOR SELECT
USING (is_active = true AND deleted_at IS NULL);

-- ============================================================================
-- TEAMS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_teams"
ON teams FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to all teams
CREATE POLICY "executive_read_teams"
ON teams FOR SELECT
USING (is_active = true AND deleted_at IS NULL);

-- ============================================================================
-- POSITIONS TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_positions"
ON positions FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Can view own positions
CREATE POLICY "executive_view_own_positions"
ON positions FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees 
    WHERE profile_id = auth.uid()
  )
  AND is_active = true
  AND deleted_at IS NULL
);

-- ============================================================================
-- CREDENTIALS TABLE POLICIES (Superadmin only - sensitive)
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_credentials"
ON credentials FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: No access (superadmin only - sensitive data)

-- ============================================================================
-- CREDENTIAL_CATEGORIES TABLE POLICIES
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_credential_categories"
ON credential_categories FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: Read-only access to credential categories (for UI display)
CREATE POLICY "executive_read_credential_categories"
ON credential_categories FOR SELECT
USING (is_active = true);

-- ============================================================================
-- JOB_PORTAL_CREDENTIALS TABLE POLICIES (Superadmin only)
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_job_portal_credentials"
ON job_portal_credentials FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: No access (superadmin only)

-- ============================================================================
-- LEADS TABLE POLICIES (Superadmin/Sales only)
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_leads"
ON leads FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: No access (superadmin/sales only)

-- ============================================================================
-- DEALS TABLE POLICIES (Superadmin/Sales only)
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_deals"
ON deals FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: No access (superadmin/sales only)

-- ============================================================================
-- QUOTATIONS TABLE POLICIES (Superadmin/Sales only)
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_quotations"
ON quotations FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: No access (superadmin/sales only)

-- ============================================================================
-- SALES_AUTOMATION_LOGS TABLE POLICIES (Superadmin only)
-- ============================================================================

-- Superadmin: Full access
CREATE POLICY "superadmin_all_sales_automation_logs"
ON sales_automation_logs FOR ALL
USING (is_superadmin(auth.uid()));

-- Executives: No access (superadmin only)

-- ============================================================================
-- PERMISSIONS TABLE POLICIES (Superadmin only)
-- ============================================================================

-- Only create if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'permissions') THEN
    EXECUTE 'CREATE POLICY "superadmin_all_permissions" ON permissions FOR ALL USING (is_superadmin(auth.uid()))';
  END IF;
END $$;

-- ============================================================================
-- ROLE_PERMISSIONS TABLE POLICIES (Superadmin only)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'role_permissions') THEN
    EXECUTE 'CREATE POLICY "superadmin_all_role_permissions" ON role_permissions FOR ALL USING (is_superadmin(auth.uid()))';
  END IF;
END $$;

-- ============================================================================
-- USER_ROLES TABLE POLICIES (Superadmin only)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    EXECUTE 'CREATE POLICY "superadmin_all_user_roles" ON user_roles FOR ALL USING (is_superadmin(auth.uid()))';
  END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "superadmin_all_profiles" ON profiles IS 'Superadmin has full access to all profiles';
COMMENT ON POLICY "executive_view_own_profile" ON profiles IS 'Executives can view their own profile';
COMMENT ON POLICY "executive_update_own_profile" ON profiles IS 'Executives can update their own profile (no role changes)';


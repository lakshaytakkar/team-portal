-- Migration: Add Manager and HR Department RLS Policies for Leave Requests
-- Adds policies for managers to view/approve team member requests and HR department users to view all requests

-- ============================================================================
-- LEAVE_REQUESTS TABLE POLICIES - MANAGER & HR
-- ============================================================================

-- Manager: Can view leave requests from direct reports
CREATE POLICY "manager_view_team_leave_requests"
ON leave_requests FOR SELECT
USING (
  -- Managers can view their own requests
  user_id = auth.uid()
  OR
  -- Managers can view requests from their direct reports
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = leave_requests.user_id
    AND p.manager_id = auth.uid()
  )
);

-- Manager: Can update (approve/reject) leave requests from direct reports (only pending)
CREATE POLICY "manager_update_team_leave_requests"
ON leave_requests FOR UPDATE
USING (
  -- Can only update pending requests
  status::text = 'pending'
  AND
  -- Must be a request from a direct report (not their own)
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = leave_requests.user_id
    AND p.manager_id = auth.uid()
    AND p.id != auth.uid()
  )
)
WITH CHECK (
  -- Can only update to approved or rejected status
  status::text IN ('approved', 'rejected')
  AND
  -- Must still be from a direct report
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = leave_requests.user_id
    AND p.manager_id = auth.uid()
  )
);

-- HR Department: Can view all leave requests
CREATE POLICY "hr_view_all_leave_requests"
ON leave_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN departments d ON d.id = p.department_id
    WHERE p.id = auth.uid()
    AND LOWER(d.code) = 'hr'
    AND p.is_active = true
  )
);

-- HR Department: Can update (approve/reject) any leave request (only pending)
CREATE POLICY "hr_update_all_leave_requests"
ON leave_requests FOR UPDATE
USING (
  -- Can only update pending requests
  status::text = 'pending'
  AND
  -- User must be in HR department
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN departments d ON d.id = p.department_id
    WHERE p.id = auth.uid()
    AND LOWER(d.code) = 'hr'
    AND p.is_active = true
  )
)
WITH CHECK (
  -- Can only update to approved or rejected status
  status::text IN ('approved', 'rejected')
  AND
  -- User must still be in HR department
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN departments d ON d.id = p.department_id
    WHERE p.id = auth.uid()
    AND LOWER(d.code) = 'hr'
    AND p.is_active = true
  )
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "manager_view_team_leave_requests" ON leave_requests IS 
'Managers can view leave requests from their direct reports';

COMMENT ON POLICY "manager_update_team_leave_requests" ON leave_requests IS 
'Managers can approve/reject pending leave requests from their direct reports';

COMMENT ON POLICY "hr_view_all_leave_requests" ON leave_requests IS 
'HR department users can view all leave requests';

COMMENT ON POLICY "hr_update_all_leave_requests" ON leave_requests IS 
'HR department users can approve/reject any pending leave request';





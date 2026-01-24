-- Migration: Seed database tables
-- Seeds all empty tables with sample data
-- Skips tables that already have data
-- Respects foreign key relationships and dependency order

DO $$
DECLARE
  v_superadmin_id UUID;
  v_profile_ids UUID[];
  v_department_ids UUID[];
  v_vertical_ids UUID[];
  v_employee_ids UUID[];
  v_asset_ids UUID[];
  v_document_type_ids UUID[];
  v_document_collection_ids UUID[];
  v_job_role_ids UUID[];
  v_job_posting_ids UUID[];
  v_job_portal_ids UUID[];
  v_role_ids UUID[];
  v_team_ids UUID[];
  v_project_ids UUID[];
  v_lead_ids UUID[];
  v_deal_ids UUID[];
  v_contact_ids UUID[];
  v_onboarding_ids UUID[];
  v_attendance_ids UUID[];
  v_count INTEGER;
BEGIN
  -- Get superadmin profile ID
  SELECT id INTO v_superadmin_id 
  FROM profiles 
  WHERE role = 'superadmin' AND is_active = true 
  LIMIT 1;
  
  -- Fallback to any active profile
  IF v_superadmin_id IS NULL THEN
    SELECT id INTO v_superadmin_id 
    FROM profiles 
    WHERE is_active = true 
    LIMIT 1;
  END IF;
  
  -- Get arrays of existing IDs for reference
  SELECT ARRAY_AGG(id) INTO v_profile_ids FROM profiles WHERE is_active = true LIMIT 20;
  SELECT ARRAY_AGG(id) INTO v_department_ids FROM departments WHERE deleted_at IS NULL LIMIT 10;
  SELECT ARRAY_AGG(id) INTO v_vertical_ids FROM verticals WHERE deleted_at IS NULL;
  SELECT ARRAY_AGG(id) INTO v_employee_ids FROM employees WHERE deleted_at IS NULL LIMIT 20;
  SELECT ARRAY_AGG(id) INTO v_asset_ids FROM assets WHERE deleted_at IS NULL LIMIT 20;
  SELECT ARRAY_AGG(id) INTO v_document_type_ids FROM document_types;
  SELECT ARRAY_AGG(id) INTO v_document_collection_ids FROM document_collections;
  SELECT ARRAY_AGG(id) INTO v_job_role_ids FROM job_roles WHERE deleted_at IS NULL;
  SELECT ARRAY_AGG(id) INTO v_job_posting_ids FROM job_postings WHERE deleted_at IS NULL LIMIT 10;
  SELECT ARRAY_AGG(id) INTO v_job_portal_ids FROM job_portals;
  
  RAISE NOTICE 'Starting database seeding...';
  RAISE NOTICE 'Using superadmin ID: %', v_superadmin_id;
  
  -- ============================================================================
  -- PHASE 1: Base Tables (permissions, roles)
  -- ============================================================================
  
  -- Seed permissions
  SELECT COUNT(*) INTO v_count FROM permissions;
  IF v_count = 0 THEN
    INSERT INTO permissions (name, resource, action, description, created_by, updated_by)
    VALUES
      ('view_projects', 'projects', 'view', 'View projects', v_superadmin_id, v_superadmin_id),
      ('create_projects', 'projects', 'create', 'Create projects', v_superadmin_id, v_superadmin_id),
      ('edit_projects', 'projects', 'edit', 'Edit projects', v_superadmin_id, v_superadmin_id),
      ('delete_projects', 'projects', 'delete', 'Delete projects', v_superadmin_id, v_superadmin_id),
      ('view_tasks', 'tasks', 'view', 'View tasks', v_superadmin_id, v_superadmin_id),
      ('create_tasks', 'tasks', 'create', 'Create tasks', v_superadmin_id, v_superadmin_id),
      ('edit_tasks', 'tasks', 'edit', 'Edit tasks', v_superadmin_id, v_superadmin_id),
      ('delete_tasks', 'tasks', 'delete', 'Delete tasks', v_superadmin_id, v_superadmin_id),
      ('view_employees', 'employees', 'view', 'View employees', v_superadmin_id, v_superadmin_id),
      ('create_employees', 'employees', 'create', 'Create employees', v_superadmin_id, v_superadmin_id),
      ('edit_employees', 'employees', 'edit', 'Edit employees', v_superadmin_id, v_superadmin_id),
      ('view_hr', 'hr', 'view', 'View HR data', v_superadmin_id, v_superadmin_id),
      ('manage_hr', 'hr', 'manage', 'Manage HR data', v_superadmin_id, v_superadmin_id),
      ('view_finance', 'finance', 'view', 'View finance data', v_superadmin_id, v_superadmin_id),
      ('manage_finance', 'finance', 'manage', 'Manage finance data', v_superadmin_id, v_superadmin_id);
    RAISE NOTICE 'Seeded permissions table';
  ELSE
    RAISE NOTICE 'Skipping permissions table (already has data)';
  END IF;
  
  -- Seed roles
  SELECT COUNT(*) INTO v_count FROM roles;
  IF v_count = 0 THEN
    INSERT INTO roles (name, description, is_system, is_active, created_by, updated_by)
    VALUES
      ('Project Manager', 'Manages projects and teams', false, true, v_superadmin_id, v_superadmin_id),
      ('Team Lead', 'Leads a team within a department', false, true, v_superadmin_id, v_superadmin_id),
      ('Senior Developer', 'Senior software developer role', false, true, v_superadmin_id, v_superadmin_id),
      ('HR Manager', 'Manages HR operations', false, true, v_superadmin_id, v_superadmin_id),
      ('Sales Manager', 'Manages sales operations', false, true, v_superadmin_id, v_superadmin_id);
    RAISE NOTICE 'Seeded roles table';
  ELSE
    RAISE NOTICE 'Skipping roles table (already has data)';
  END IF;
  
  -- Get role IDs for later use
  SELECT ARRAY_AGG(id) INTO v_role_ids FROM roles WHERE deleted_at IS NULL;
  
  -- ============================================================================
  -- PHASE 2: Hierarchy Tables (teams, positions)
  -- ============================================================================
  
  -- Seed teams
  SELECT COUNT(*) INTO v_count FROM teams;
  IF v_count = 0 AND array_length(v_department_ids, 1) > 0 AND array_length(v_vertical_ids, 1) > 0 THEN
    INSERT INTO teams (department_id, vertical_id, name, code, is_active, created_by, updated_by)
    SELECT 
      d.id,
      v.id,
      d.name || ' – ' || v.name,
      LOWER(REPLACE(d.name || '-' || v.name, ' ', '-')),
      true,
      v_superadmin_id,
      v_superadmin_id
    FROM departments d
    CROSS JOIN verticals v
    WHERE d.deleted_at IS NULL 
      AND v.deleted_at IS NULL
      AND d.id = ANY(v_department_ids)
      AND v.id = ANY(v_vertical_ids)
    LIMIT 10;
    RAISE NOTICE 'Seeded teams table';
  ELSE
    RAISE NOTICE 'Skipping teams table (already has data or missing dependencies)';
  END IF;
  
  -- Get team IDs
  SELECT ARRAY_AGG(id) INTO v_team_ids FROM teams WHERE deleted_at IS NULL LIMIT 10;
  
  -- Seed positions
  SELECT COUNT(*) INTO v_count FROM positions;
  IF v_count = 0 
    AND array_length(v_employee_ids, 1) > 0 
    AND array_length(v_team_ids, 1) > 0 
    AND array_length(v_role_ids, 1) > 0 THEN
    INSERT INTO positions (employee_id, team_id, role_id, title, is_primary, start_date, is_active, created_by, updated_by)
    SELECT 
      e.id,
      t.id,
      r.id,
      r.name,
      ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY RANDOM()) = 1, -- One primary per employee
      CURRENT_DATE - (RANDOM() * 365)::INTEGER, -- Random start date within last year
      true,
      v_superadmin_id,
      v_superadmin_id
    FROM employees e
    CROSS JOIN LATERAL (SELECT id FROM teams WHERE deleted_at IS NULL ORDER BY RANDOM() LIMIT 1) t
    CROSS JOIN LATERAL (SELECT id, name FROM roles WHERE deleted_at IS NULL ORDER BY RANDOM() LIMIT 1) r
    WHERE e.deleted_at IS NULL
      AND e.id = ANY(v_employee_ids)
    LIMIT 15;
    RAISE NOTICE 'Seeded positions table';
  ELSE
    RAISE NOTICE 'Skipping positions table (already has data or missing dependencies)';
  END IF;
  
  -- ============================================================================
  -- PHASE 3: Projects (projects, project_members)
  -- ============================================================================
  
  -- Seed projects
  SELECT COUNT(*) INTO v_count FROM projects;
  IF v_count = 0 AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO projects (name, description, status, priority, progress, start_date, end_date, due_date, owner_id, created_by, updated_by)
    SELECT 
      project_names.name,
      'Project description for ' || project_names.name,
      (ARRAY['planning', 'active', 'on-hold', 'completed'])[FLOOR(RANDOM() * 4 + 1)::INTEGER]::project_status,
      (ARRAY['low', 'medium', 'high', 'urgent'])[FLOOR(RANDOM() * 4 + 1)::INTEGER]::project_priority,
      FLOOR(RANDOM() * 100)::INTEGER,
      CURRENT_DATE - (RANDOM() * 180)::INTEGER,
      CASE WHEN RANDOM() > 0.5 THEN CURRENT_DATE + (RANDOM() * 90)::INTEGER ELSE NULL END,
      CURRENT_DATE + (RANDOM() * 120)::INTEGER,
      p.id,
      v_superadmin_id,
      v_superadmin_id
    FROM (
      VALUES 
        ('Website Redesign'),
        ('Mobile App Development'),
        ('Marketing Campaign Q1'),
        ('Customer Portal'),
        ('API Integration'),
        ('Data Migration'),
        ('Security Audit'),
        ('Performance Optimization')
    ) AS project_names(name)
    CROSS JOIN LATERAL (SELECT id FROM profiles WHERE is_active = true ORDER BY RANDOM() LIMIT 1) p
    LIMIT 8;
    RAISE NOTICE 'Seeded projects table';
  ELSE
    RAISE NOTICE 'Skipping projects table (already has data or missing dependencies)';
  END IF;
  
  -- Get project IDs
  SELECT ARRAY_AGG(id) INTO v_project_ids FROM projects WHERE deleted_at IS NULL LIMIT 8;
  
  -- Seed project_members
  SELECT COUNT(*) INTO v_count FROM project_members;
  IF v_count = 0 AND array_length(v_project_ids, 1) > 0 AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO project_members (project_id, user_id, role, created_by, updated_by)
    SELECT 
      pr.id,
      p.id,
      (ARRAY['owner', 'member', 'viewer'])[FLOOR(RANDOM() * 3 + 1)::INTEGER]::project_member_role,
      v_superadmin_id,
      v_superadmin_id
    FROM projects pr
    CROSS JOIN LATERAL (
      SELECT id FROM profiles 
      WHERE is_active = true 
      ORDER BY RANDOM() 
      LIMIT 3
    ) p
    WHERE pr.deleted_at IS NULL
      AND pr.id = ANY(v_project_ids);
    RAISE NOTICE 'Seeded project_members table';
  ELSE
    RAISE NOTICE 'Skipping project_members table (already has data or missing dependencies)';
  END IF;
  
  -- ============================================================================
  -- PHASE 4: Sales Module (leads, deals, quotations, sales_automation_logs)
  -- ============================================================================
  
  -- Seed leads
  SELECT COUNT(*) INTO v_count FROM leads;
  IF v_count = 0 AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO leads (company, contact_name, email, phone, status, source, value, assigned_to_id, notes, created_by, updated_by)
    SELECT 
      company_data.company,
      company_data.contact,
      LOWER(REPLACE(company_data.contact, ' ', '.')) || '@example.com',
      '+1-555-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
      (ARRAY['new', 'contacted', 'qualified', 'converted', 'lost'])[FLOOR(RANDOM() * 5 + 1)::INTEGER]::lead_status,
      (ARRAY['website', 'referral', 'cold-call', 'email', 'social-media'])[FLOOR(RANDOM() * 5 + 1)::INTEGER],
      (RANDOM() * 50000 + 1000)::NUMERIC(10, 2),
      p.id,
      'Initial contact notes for ' || company_data.company,
      v_superadmin_id,
      v_superadmin_id
    FROM (
      VALUES 
        ('Acme Corp', 'John Smith'),
        ('TechStart Inc', 'Sarah Johnson'),
        ('Global Solutions', 'Mike Davis'),
        ('Innovation Labs', 'Emily Chen'),
        ('Digital Ventures', 'David Wilson'),
        ('Cloud Systems', 'Lisa Anderson'),
        ('Future Tech', 'Robert Brown'),
        ('Smart Solutions', 'Jennifer Lee')
    ) AS company_data(company, contact)
    CROSS JOIN LATERAL (SELECT id FROM profiles WHERE is_active = true ORDER BY RANDOM() LIMIT 1) p
    LIMIT 8;
    RAISE NOTICE 'Seeded leads table';
  ELSE
    RAISE NOTICE 'Skipping leads table (already has data or missing dependencies)';
  END IF;
  
  -- Get lead IDs
  SELECT ARRAY_AGG(id) INTO v_lead_ids FROM leads WHERE deleted_at IS NULL LIMIT 8;
  
  -- Seed deals
  SELECT COUNT(*) INTO v_count FROM deals;
  IF v_count = 0 AND array_length(v_lead_ids, 1) > 0 AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO deals (lead_id, name, value, stage, probability, close_date, assigned_to_id, created_by, updated_by)
    SELECT 
      l.id,
      'Deal: ' || l.company,
      l.value * (RANDOM() * 0.5 + 0.8), -- 80-130% of lead value
      (ARRAY['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'])[FLOOR(RANDOM() * 6 + 1)::INTEGER]::deal_stage,
      FLOOR(RANDOM() * 100)::INTEGER,
      CASE WHEN RANDOM() > 0.3 THEN CURRENT_DATE + (RANDOM() * 90)::INTEGER ELSE NULL END,
      p.id,
      v_superadmin_id,
      v_superadmin_id
    FROM leads l
    CROSS JOIN LATERAL (SELECT id FROM profiles WHERE is_active = true ORDER BY RANDOM() LIMIT 1) p
    WHERE l.deleted_at IS NULL
      AND l.id = ANY(v_lead_ids)
    LIMIT 6;
    RAISE NOTICE 'Seeded deals table';
  ELSE
    RAISE NOTICE 'Skipping deals table (already has data or missing dependencies)';
  END IF;
  
  -- Get deal IDs
  SELECT ARRAY_AGG(id) INTO v_deal_ids FROM deals WHERE deleted_at IS NULL LIMIT 6;
  
  -- Seed quotations
  SELECT COUNT(*) INTO v_count FROM quotations;
  IF v_count = 0 AND array_length(v_deal_ids, 1) > 0 THEN
    INSERT INTO quotations (deal_id, quotation_number, amount, status, valid_until, created_by, updated_by)
    SELECT 
      d.id,
      'QUO-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 4, '0'),
      d.value * (RANDOM() * 0.2 + 0.9), -- 90-110% of deal value
      (ARRAY['draft', 'sent', 'accepted', 'rejected', 'expired'])[FLOOR(RANDOM() * 5 + 1)::INTEGER]::quotation_status,
      CURRENT_DATE + (RANDOM() * 30 + 15)::INTEGER, -- 15-45 days from now
      v_superadmin_id,
      v_superadmin_id
    FROM deals d
    WHERE d.deleted_at IS NULL
      AND d.id = ANY(v_deal_ids)
    LIMIT 5;
    RAISE NOTICE 'Seeded quotations table';
  ELSE
    RAISE NOTICE 'Skipping quotations table (already has data or missing dependencies)';
  END IF;
  
  -- Seed sales_automation_logs
  SELECT COUNT(*) INTO v_count FROM sales_automation_logs;
  IF v_count = 0 AND array_length(v_lead_ids, 1) > 0 AND array_length(v_deal_ids, 1) > 0 THEN
    INSERT INTO sales_automation_logs (type, entity_id, entity_type, action, status, error_message)
    SELECT 
      'email_notification',
      l.id,
      'lead',
      'send_welcome_email',
      (ARRAY['success', 'failed'])[FLOOR(RANDOM() * 2 + 1)::INTEGER]::automation_log_status,
      CASE WHEN RANDOM() > 0.8 THEN 'Email service temporarily unavailable' ELSE NULL END
    FROM leads l
    WHERE l.deleted_at IS NULL
      AND l.id = ANY(v_lead_ids)
    LIMIT 5;
    
    INSERT INTO sales_automation_logs (type, entity_id, entity_type, action, status, error_message)
    SELECT 
      'status_update',
      d.id,
      'deal',
      'update_stage',
      'success',
      NULL
    FROM deals d
    WHERE d.deleted_at IS NULL
      AND d.id = ANY(v_deal_ids)
    LIMIT 3;
    
    RAISE NOTICE 'Seeded sales_automation_logs table';
  ELSE
    RAISE NOTICE 'Skipping sales_automation_logs table (already has data or missing dependencies)';
  END IF;
  
  -- ============================================================================
  -- PHASE 5: Contacts & Calls (contacts, calls)
  -- ============================================================================
  
  -- Seed contacts
  SELECT COUNT(*) INTO v_count FROM contacts;
  IF v_count = 0 THEN
    INSERT INTO contacts (full_name, email, phone, company, position, website, linkedin, notes, is_active, created_by, updated_by)
    VALUES
      ('Alice Johnson', 'alice.johnson@example.com', '+1-555-0101', 'Tech Corp', 'CTO', 'https://techcorp.com', 'https://linkedin.com/in/alicej', 'Key contact for enterprise deals', true, v_superadmin_id, v_superadmin_id),
      ('Bob Williams', 'bob.williams@example.com', '+1-555-0102', 'Digital Inc', 'VP Sales', 'https://digitalinc.com', 'https://linkedin.com/in/bobw', 'Interested in our services', true, v_superadmin_id, v_superadmin_id),
      ('Carol Davis', 'carol.davis@example.com', '+1-555-0103', 'Innovation Labs', 'Director', 'https://innovationlabs.com', 'https://linkedin.com/in/carold', 'Follow up needed', true, v_superadmin_id, v_superadmin_id),
      ('David Miller', 'david.miller@example.com', '+1-555-0104', 'Cloud Systems', 'CEO', 'https://cloudsystems.com', 'https://linkedin.com/in/davidm', 'Potential partnership', true, v_superadmin_id, v_superadmin_id),
      ('Eva Brown', 'eva.brown@example.com', '+1-555-0105', 'Future Tech', 'CMO', 'https://futuretech.com', 'https://linkedin.com/in/evab', 'Marketing collaboration', true, v_superadmin_id, v_superadmin_id);
    RAISE NOTICE 'Seeded contacts table';
  ELSE
    RAISE NOTICE 'Skipping contacts table (already has data)';
  END IF;
  
  -- Get contact IDs
  SELECT ARRAY_AGG(id) INTO v_contact_ids FROM contacts WHERE deleted_at IS NULL LIMIT 5;
  
  -- Seed calls
  SELECT COUNT(*) INTO v_count FROM calls;
  IF v_count = 0 
    AND array_length(v_contact_ids, 1) > 0 
    AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO calls (date, time, contact_id, contact_name, company, phone, email, outcome, notes, next_action, next_action_date, assigned_to_id, status, duration, created_by, updated_by)
    SELECT 
      CURRENT_DATE - (RANDOM() * 30)::INTEGER, -- Last 30 days
      (CURRENT_TIME - (RANDOM() * 8 * INTERVAL '1 hour'))::TIME,
      c.id,
      c.full_name,
      c.company,
      c.phone,
      c.email,
      (ARRAY['connected', 'voicemail', 'no-answer', 'busy', 'callback-requested', 'not-interested', 'interested', 'meeting-scheduled'])[FLOOR(RANDOM() * 8 + 1)::INTEGER]::call_outcome,
      'Call notes for ' || c.full_name,
      CASE WHEN RANDOM() > 0.5 THEN 'Follow up email' ELSE 'Schedule meeting' END,
      CASE WHEN RANDOM() > 0.5 THEN CURRENT_DATE + (RANDOM() * 7)::INTEGER ELSE NULL END,
      p.id,
      (ARRAY['scheduled', 'completed', 'cancelled', 'rescheduled'])[FLOOR(RANDOM() * 4 + 1)::INTEGER]::call_status,
      CASE WHEN RANDOM() > 0.6 THEN FLOOR(RANDOM() * 1800 + 300)::INTEGER ELSE NULL END, -- 5-35 minutes
      v_superadmin_id,
      v_superadmin_id
    FROM contacts c
    CROSS JOIN LATERAL (SELECT id FROM profiles WHERE is_active = true ORDER BY RANDOM() LIMIT 1) p
    WHERE c.deleted_at IS NULL
      AND c.id = ANY(v_contact_ids)
    LIMIT 10;
    RAISE NOTICE 'Seeded calls table';
  ELSE
    RAISE NOTICE 'Skipping calls table (already has data or missing dependencies)';
  END IF;
  
  -- ============================================================================
  -- PHASE 6: Employee Management (employee_departments, onboardings, onboarding_tasks, employee_documents, asset_assignments)
  -- ============================================================================
  
  -- Seed employee_departments
  SELECT COUNT(*) INTO v_count FROM employee_departments;
  IF v_count = 0 
    AND array_length(v_employee_ids, 1) > 0 
    AND array_length(v_department_ids, 1) > 0 THEN
    INSERT INTO employee_departments (employee_id, department_id, is_primary, start_date, created_by, updated_by)
    SELECT 
      e.id,
      d.id,
      ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY RANDOM()) = 1, -- One primary per employee
      CURRENT_DATE - (RANDOM() * 365)::INTEGER, -- Random start date within last year
      v_superadmin_id,
      v_superadmin_id
    FROM employees e
    CROSS JOIN LATERAL (SELECT id FROM departments WHERE deleted_at IS NULL ORDER BY RANDOM() LIMIT 1) d
    WHERE e.deleted_at IS NULL
      AND e.id = ANY(v_employee_ids)
    LIMIT 15;
    RAISE NOTICE 'Seeded employee_departments table';
  ELSE
    RAISE NOTICE 'Skipping employee_departments table (already has data or missing dependencies)';
  END IF;
  
  -- Seed onboardings
  SELECT COUNT(*) INTO v_count FROM onboardings;
  IF v_count = 0 
    AND array_length(v_employee_ids, 1) > 0 
    AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO onboardings (employee_id, status, start_date, completion_date, assigned_to_id, notes, created_by, updated_by)
    SELECT 
      e.id,
      (ARRAY['pending', 'in-progress', 'completed', 'on-hold'])[FLOOR(RANDOM() * 4 + 1)::INTEGER]::onboarding_status,
      CURRENT_DATE - (RANDOM() * 60)::INTEGER, -- Last 60 days
      CASE WHEN RANDOM() > 0.6 THEN CURRENT_DATE - (RANDOM() * 30)::INTEGER ELSE NULL END,
      p.id,
      'Onboarding notes for employee ' || e.id::TEXT,
      v_superadmin_id,
      v_superadmin_id
    FROM employees e
    CROSS JOIN LATERAL (SELECT id FROM profiles WHERE is_active = true ORDER BY RANDOM() LIMIT 1) p
    WHERE e.deleted_at IS NULL
      AND e.id = ANY(v_employee_ids)
    LIMIT 10;
    RAISE NOTICE 'Seeded onboardings table';
  ELSE
    RAISE NOTICE 'Skipping onboardings table (already has data or missing dependencies)';
  END IF;
  
  -- Get onboarding IDs
  SELECT ARRAY_AGG(id) INTO v_onboarding_ids FROM onboardings LIMIT 10;
  
  -- Seed onboarding_tasks
  SELECT COUNT(*) INTO v_count FROM onboarding_tasks;
  IF v_count = 0 
    AND array_length(v_onboarding_ids, 1) > 0 
    AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO onboarding_tasks (onboarding_id, title, description, assigned_to_id, due_date, completed, completed_at, sort_order, created_by, updated_by)
    SELECT 
      o.id,
      task_data.title,
      task_data.description,
      p.id,
      o.start_date + (task_data.days_offset || ' days')::INTERVAL,
      RANDOM() > 0.4, -- 60% completed
      CASE WHEN RANDOM() > 0.4 THEN o.start_date + (RANDOM() * task_data.days_offset)::INTEGER ELSE NULL END,
      task_data.sort_order,
      v_superadmin_id,
      v_superadmin_id
    FROM onboardings o
    CROSS JOIN (
      VALUES 
        ('Complete HR paperwork', 'Fill out all required HR forms', 0, 1),
        ('Setup workstation', 'Configure computer and workspace', 1, 2),
        ('Attend orientation', 'Company orientation session', 2, 3),
        ('Meet team members', 'Introduction to team', 3, 4),
        ('Review company policies', 'Read and acknowledge policies', 4, 5)
    ) AS task_data(title, description, days_offset, sort_order)
    CROSS JOIN LATERAL (SELECT id FROM profiles WHERE is_active = true ORDER BY RANDOM() LIMIT 1) p
    WHERE o.id = ANY(v_onboarding_ids)
    LIMIT 30;
    RAISE NOTICE 'Seeded onboarding_tasks table';
  ELSE
    RAISE NOTICE 'Skipping onboarding_tasks table (already has data or missing dependencies)';
  END IF;
  
  -- Seed employee_documents
  SELECT COUNT(*) INTO v_count FROM employee_documents;
  IF v_count = 0 
    AND array_length(v_employee_ids, 1) > 0 
    AND array_length(v_document_type_ids, 1) > 0 
    AND array_length(v_document_collection_ids, 1) > 0 THEN
    INSERT INTO employee_documents (
      employee_id, document_type_id, collection_id, name, file_name, file_path, 
      file_size, mime_type, collection_status, document_status, expiry_date, 
      issued_date, signed_date, uploaded_by, issued_by, signed_by, 
      created_by, updated_by
    )
    SELECT 
      e.id,
      dt.id,
      dc.id,
      dt.name || ' - ' || e.id::TEXT,
      LOWER(REPLACE(dt.name, ' ', '_')) || '_' || e.id::TEXT || '.pdf',
      'documents/employees/' || e.id::TEXT || '/' || LOWER(REPLACE(dt.name, ' ', '_')) || '.pdf',
      FLOOR(RANDOM() * 5000000 + 100000)::BIGINT, -- 100KB to 5MB
      'application/pdf',
      (ARRAY['pending', 'collected', 'expired', 'missing'])[FLOOR(RANDOM() * 4 + 1)::INTEGER],
      CASE WHEN dt.is_signed_document THEN NULL ELSE (ARRAY['draft', 'issued', 'signed', 'archived'])[FLOOR(RANDOM() * 4 + 1)::INTEGER] END,
      CASE WHEN dt.expiry_tracking THEN CURRENT_DATE + (RANDOM() * 365)::INTEGER ELSE NULL END,
      CASE WHEN RANDOM() > 0.3 THEN CURRENT_DATE - (RANDOM() * 90)::INTEGER ELSE NULL END,
      CASE WHEN dt.is_signed_document AND RANDOM() > 0.5 THEN CURRENT_DATE - (RANDOM() * 60)::INTEGER ELSE NULL END,
      p1.id,
      CASE WHEN RANDOM() > 0.5 THEN p2.id ELSE NULL END,
      CASE WHEN dt.is_signed_document AND RANDOM() > 0.5 THEN p3.id ELSE NULL END,
      v_superadmin_id,
      v_superadmin_id
    FROM employees e
    CROSS JOIN document_types dt
    CROSS JOIN document_collections dc
    CROSS JOIN LATERAL (SELECT id FROM profiles WHERE is_active = true ORDER BY RANDOM() LIMIT 1) p1
    CROSS JOIN LATERAL (SELECT id FROM profiles WHERE is_active = true ORDER BY RANDOM() LIMIT 1) p2
    CROSS JOIN LATERAL (SELECT id FROM profiles WHERE is_active = true ORDER BY RANDOM() LIMIT 1) p3
    WHERE e.deleted_at IS NULL
      AND e.id = ANY(v_employee_ids)
      AND dt.id = ANY(v_document_type_ids)
      AND dc.id = ANY(v_document_collection_ids)
    LIMIT 20;
    RAISE NOTICE 'Seeded employee_documents table';
  ELSE
    RAISE NOTICE 'Skipping employee_documents table (already has data or missing dependencies)';
  END IF;
  
  -- Seed asset_assignments
  SELECT COUNT(*) INTO v_count FROM asset_assignments;
  IF v_count = 0 
    AND array_length(v_asset_ids, 1) > 0 
    AND array_length(v_employee_ids, 1) > 0 THEN
    INSERT INTO asset_assignments (asset_id, employee_id, assigned_date, return_date, assigned_by, return_notes)
    SELECT 
      a.id,
      e.id,
      CURRENT_DATE - (RANDOM() * 180)::INTEGER, -- Last 6 months
      CASE WHEN RANDOM() > 0.7 THEN CURRENT_DATE - (RANDOM() * 30)::INTEGER ELSE NULL END, -- 30% returned
      p.id,
      CASE WHEN RANDOM() > 0.7 THEN 'Asset returned in good condition' ELSE NULL END
    FROM assets a
    CROSS JOIN LATERAL (SELECT id FROM employees WHERE deleted_at IS NULL ORDER BY RANDOM() LIMIT 1) e
    CROSS JOIN LATERAL (SELECT id FROM profiles WHERE is_active = true ORDER BY RANDOM() LIMIT 1) p
    WHERE a.deleted_at IS NULL
      AND a.id = ANY(v_asset_ids)
      AND e.id = ANY(v_employee_ids)
    LIMIT 15;
    RAISE NOTICE 'Seeded asset_assignments table';
  ELSE
    RAISE NOTICE 'Skipping asset_assignments table (already has data or missing dependencies)';
  END IF;
  
  -- ============================================================================
  -- PHASE 7: Attendance & Leave (attendance, attendance_corrections, leave_requests)
  -- ============================================================================
  
  -- Seed attendance
  SELECT COUNT(*) INTO v_count FROM attendance;
  IF v_count = 0 AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO attendance (user_id, date, check_in_time, check_out_time, status, notes, created_by, updated_by)
    SELECT 
      p.id,
      CURRENT_DATE - (RANDOM() * 30)::INTEGER, -- Last 30 days
      CURRENT_TIMESTAMP - (RANDOM() * 12 * INTERVAL '1 hour') - (RANDOM() * 30 * INTERVAL '1 day'),
      CURRENT_TIMESTAMP - (RANDOM() * 8 * INTERVAL '1 hour') - (RANDOM() * 30 * INTERVAL '1 day'),
      (ARRAY['present', 'absent', 'late', 'half-day', 'leave'])[FLOOR(RANDOM() * 5 + 1)::INTEGER]::attendance_status,
      CASE WHEN RANDOM() > 0.8 THEN 'Remote work day' ELSE NULL END,
      v_superadmin_id,
      v_superadmin_id
    FROM profiles p
    WHERE p.is_active = true
      AND p.id = ANY(v_profile_ids)
    LIMIT 50;
    RAISE NOTICE 'Seeded attendance table';
  ELSE
    RAISE NOTICE 'Skipping attendance table (already has data or missing dependencies)';
  END IF;
  
  -- Get attendance IDs
  SELECT ARRAY_AGG(id) INTO v_attendance_ids FROM attendance LIMIT 10;
  
  -- Seed attendance_corrections
  SELECT COUNT(*) INTO v_count FROM attendance_corrections;
  IF v_count = 0 
    AND array_length(v_attendance_ids, 1) > 0 
    AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO attendance_corrections (
      attendance_id, requested_by_id, requested_date, requested_check_in, 
      requested_check_out, reason, status, reviewed_by_id, reviewed_at, 
      review_notes, created_by, updated_by
    )
    SELECT 
      a.id,
      a.user_id,
      CURRENT_DATE - (RANDOM() * 7)::INTEGER, -- Last week
      a.check_in_time + (RANDOM() * 2 - 1) * INTERVAL '1 hour',
      a.check_out_time + (RANDOM() * 2 - 1) * INTERVAL '1 hour',
      'Forgot to check in/out correctly',
      (ARRAY['pending', 'approved', 'rejected'])[FLOOR(RANDOM() * 3 + 1)::INTEGER]::correction_status,
      CASE WHEN RANDOM() > 0.5 THEN p.id ELSE NULL END,
      CASE WHEN RANDOM() > 0.5 THEN CURRENT_DATE - (RANDOM() * 3)::INTEGER ELSE NULL END,
      CASE WHEN RANDOM() > 0.5 THEN 'Correction approved' ELSE NULL END,
      v_superadmin_id,
      v_superadmin_id
    FROM attendance a
    CROSS JOIN LATERAL (SELECT id FROM profiles WHERE is_active = true AND role IN ('manager', 'superadmin') ORDER BY RANDOM() LIMIT 1) p
    WHERE a.id = ANY(v_attendance_ids)
    LIMIT 5;
    RAISE NOTICE 'Seeded attendance_corrections table';
  ELSE
    RAISE NOTICE 'Skipping attendance_corrections table (already has data or missing dependencies)';
  END IF;
  
  -- Seed leave_requests
  SELECT COUNT(*) INTO v_count FROM leave_requests;
  IF v_count = 0 AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO leave_requests (
      user_id, type, start_date, end_date, days, status, reason, 
      approved_by_id, approved_at, approval_notes, metadata, created_by, updated_by
    )
    SELECT 
      p.id,
      (ARRAY['vacation', 'sick', 'personal', 'other'])[FLOOR(RANDOM() * 4 + 1)::INTEGER]::leave_type,
      CURRENT_DATE + (RANDOM() * 60)::INTEGER, -- Next 60 days
      CURRENT_DATE + (RANDOM() * 60 + 1)::INTEGER,
      FLOOR(RANDOM() * 5 + 1)::INTEGER, -- 1-5 days
      (ARRAY['pending', 'approved', 'rejected', 'cancelled'])[FLOOR(RANDOM() * 4 + 1)::INTEGER]::leave_request_status,
      'Leave request reason',
      CASE WHEN RANDOM() > 0.5 THEN p2.id ELSE NULL END,
      CASE WHEN RANDOM() > 0.5 THEN CURRENT_DATE - (RANDOM() * 7)::INTEGER ELSE NULL END,
      CASE WHEN RANDOM() > 0.5 THEN 'Leave approved' ELSE NULL END,
      jsonb_build_object(
        'coverage_plan', 'Team member will cover',
        'contact_during_leave', p.email,
        'documents', ARRAY[]::TEXT[]
      ),
      v_superadmin_id,
      v_superadmin_id
    FROM profiles p
    CROSS JOIN LATERAL (SELECT id FROM profiles WHERE is_active = true AND role IN ('manager', 'superadmin') ORDER BY RANDOM() LIMIT 1) p2
    WHERE p.is_active = true
      AND p.id = ANY(v_profile_ids)
    LIMIT 15;
    RAISE NOTICE 'Seeded leave_requests table';
  ELSE
    RAISE NOTICE 'Skipping leave_requests table (already has data or missing dependencies)';
  END IF;
  
  -- ============================================================================
  -- PHASE 8: Personal & Goals (goals, daily_reports, knowledge_base_articles, meeting_notes, personal_documents, personal_notes, trainings)
  -- ============================================================================
  
  -- Seed goals
  SELECT COUNT(*) INTO v_count FROM goals;
  IF v_count = 0 AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO goals (user_id, title, description, status, priority, progress, target_date, completed_at, created_by, updated_by)
    SELECT 
      p.id,
      goal_data.title,
      goal_data.description,
      (ARRAY['not-started', 'in-progress', 'completed', 'on-hold', 'cancelled'])[FLOOR(RANDOM() * 5 + 1)::INTEGER]::goal_status,
      (ARRAY['low', 'medium', 'high'])[FLOOR(RANDOM() * 3 + 1)::INTEGER]::goal_priority,
      FLOOR(RANDOM() * 100)::INTEGER,
      CURRENT_DATE + (RANDOM() * 180)::INTEGER, -- Next 6 months
      CASE WHEN RANDOM() > 0.7 THEN CURRENT_DATE - (RANDOM() * 30)::INTEGER ELSE NULL END,
      v_superadmin_id,
      v_superadmin_id
    FROM profiles p
    CROSS JOIN (
      VALUES 
        ('Complete certification', 'Finish professional certification course'),
        ('Improve skills', 'Learn new technologies and frameworks'),
        ('Team leadership', 'Lead a successful project team'),
        ('Performance improvement', 'Achieve better performance metrics'),
        ('Career advancement', 'Prepare for next role level')
    ) AS goal_data(title, description)
    WHERE p.is_active = true
      AND p.id = ANY(v_profile_ids)
    LIMIT 20;
    RAISE NOTICE 'Seeded goals table';
  ELSE
    RAISE NOTICE 'Skipping goals table (already has data or missing dependencies)';
  END IF;
  
  -- Seed daily_reports
  SELECT COUNT(*) INTO v_count FROM daily_reports;
  IF v_count = 0 AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO daily_reports (user_id, date, tasks_completed, tasks_planned, blockers, notes, status, created_by, updated_by)
    SELECT 
      p.id,
      CURRENT_DATE - (RANDOM() * 14)::INTEGER, -- Last 2 weeks
      jsonb_build_array(
        jsonb_build_object('task', 'Task 1', 'status', 'completed'),
        jsonb_build_object('task', 'Task 2', 'status', 'completed')
      ),
      jsonb_build_array(
        jsonb_build_object('task', 'Task 3', 'priority', 'high'),
        jsonb_build_object('task', 'Task 4', 'priority', 'medium')
      ),
      jsonb_build_array(
        jsonb_build_object('blocker', 'Waiting for API access', 'severity', 'medium')
      ),
      'Daily work summary',
      (ARRAY['draft', 'submitted'])[FLOOR(RANDOM() * 2 + 1)::INTEGER]::daily_report_status,
      v_superadmin_id,
      v_superadmin_id
    FROM profiles p
    WHERE p.is_active = true
      AND p.id = ANY(v_profile_ids)
    LIMIT 30;
    RAISE NOTICE 'Seeded daily_reports table';
  ELSE
    RAISE NOTICE 'Skipping daily_reports table (already has data or missing dependencies)';
  END IF;
  
  -- Seed knowledge_base_articles
  SELECT COUNT(*) INTO v_count FROM knowledge_base_articles;
  IF v_count = 0 AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO knowledge_base_articles (created_by_id, title, content, category, tags, views, is_published, published_at, created_by, updated_by)
    SELECT 
      p.id,
      article_data.title,
      article_data.content,
      article_data.category,
      jsonb_build_array(article_data.tag1, article_data.tag2),
      FLOOR(RANDOM() * 1000)::INTEGER,
      RANDOM() > 0.3, -- 70% published
      CASE WHEN RANDOM() > 0.3 THEN CURRENT_DATE - (RANDOM() * 60)::INTEGER ELSE NULL END,
      v_superadmin_id,
      v_superadmin_id
    FROM profiles p
    CROSS JOIN (
      VALUES 
        ('Getting Started Guide', 'Complete guide for new users...', 'Documentation', 'getting-started', 'tutorial'),
        ('API Reference', 'Complete API documentation...', 'Technical', 'api', 'reference'),
        ('Best Practices', 'Recommended practices for...', 'Guidelines', 'best-practices', 'guidelines'),
        ('Troubleshooting', 'Common issues and solutions...', 'Support', 'troubleshooting', 'help'),
        ('Security Guidelines', 'Security best practices...', 'Security', 'security', 'compliance')
    ) AS article_data(title, content, category, tag1, tag2)
    WHERE p.is_active = true
      AND p.id = ANY(v_profile_ids)
    LIMIT 10;
    RAISE NOTICE 'Seeded knowledge_base_articles table';
  ELSE
    RAISE NOTICE 'Skipping knowledge_base_articles table (already has data or missing dependencies)';
  END IF;
  
  -- Seed meeting_notes
  SELECT COUNT(*) INTO v_count FROM meeting_notes;
  IF v_count = 0 AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO meeting_notes (user_id, title, content, meeting_date, attendees, tags, created_by, updated_by)
    SELECT 
      p.id,
      'Meeting: ' || meeting_data.topic,
      'Meeting notes for ' || meeting_data.topic || '. Discussion points and action items.',
      CURRENT_DATE - (RANDOM() * 30)::INTEGER, -- Last 30 days
      jsonb_build_array(
        jsonb_build_object('name', 'John Doe', 'role', 'Manager'),
        jsonb_build_object('name', 'Jane Smith', 'role', 'Developer')
      ),
      jsonb_build_array(meeting_data.tag),
      v_superadmin_id,
      v_superadmin_id
    FROM profiles p
    CROSS JOIN (
      VALUES 
        ('Project Planning', 'project'),
        ('Team Standup', 'standup'),
        ('Client Review', 'client'),
        ('Sprint Retrospective', 'retro'),
        ('Strategy Session', 'strategy')
    ) AS meeting_data(topic, tag)
    WHERE p.is_active = true
      AND p.id = ANY(v_profile_ids)
    LIMIT 15;
    RAISE NOTICE 'Seeded meeting_notes table';
  ELSE
    RAISE NOTICE 'Skipping meeting_notes table (already has data or missing dependencies)';
  END IF;
  
  -- Seed personal_documents
  SELECT COUNT(*) INTO v_count FROM personal_documents;
  IF v_count = 0 AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO personal_documents (user_id, name, type, size, url, mime_type, uploaded_at, created_by, updated_by)
    SELECT 
      p.id,
      doc_data.name,
      doc_data.type::document_type,
      FLOOR(RANDOM() * 5000000 + 100000)::INTEGER, -- 100KB to 5MB
      'https://storage.example.com/documents/' || p.id::TEXT || '/' || LOWER(REPLACE(doc_data.name, ' ', '_')) || '.' || doc_data.extension,
      doc_data.mime_type,
      CURRENT_DATE - (RANDOM() * 90)::INTEGER, -- Last 90 days
      v_superadmin_id,
      v_superadmin_id
    FROM profiles p
    CROSS JOIN (
      VALUES 
        ('Resume', 'pdf', 'application/pdf', 'doc'),
        ('Certificate', 'pdf', 'application/pdf', 'doc'),
        ('Photo', 'image', 'image/jpeg', 'image'),
        ('Contract', 'pdf', 'application/pdf', 'doc')
    ) AS doc_data(name, extension, mime_type, type)
    WHERE p.is_active = true
      AND p.id = ANY(v_profile_ids)
    LIMIT 20;
    RAISE NOTICE 'Seeded personal_documents table';
  ELSE
    RAISE NOTICE 'Skipping personal_documents table (already has data or missing dependencies)';
  END IF;
  
  -- Seed personal_notes
  SELECT COUNT(*) INTO v_count FROM personal_notes;
  IF v_count = 0 AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO personal_notes (user_id, title, content, type, tags, created_by, updated_by)
    SELECT 
      p.id,
      note_data.title,
      note_data.content,
      note_data.type::note_type,
      jsonb_build_array(note_data.tag),
      v_superadmin_id,
      v_superadmin_id
    FROM profiles p
    CROSS JOIN (
      VALUES 
        ('Project Ideas', 'Ideas for future projects...', 'project', 'ideas'),
        ('Meeting Reminder', 'Reminder for upcoming meeting...', 'meeting', 'reminder'),
        ('Personal Task', 'Personal task to complete...', 'personal', 'task'),
        ('Learning Notes', 'Notes from learning session...', 'other', 'learning')
    ) AS note_data(title, content, type, tag)
    WHERE p.is_active = true
      AND p.id = ANY(v_profile_ids)
    LIMIT 20;
    RAISE NOTICE 'Seeded personal_notes table';
  ELSE
    RAISE NOTICE 'Skipping personal_notes table (already has data or missing dependencies)';
  END IF;
  
  -- Seed trainings
  SELECT COUNT(*) INTO v_count FROM trainings;
  IF v_count = 0 AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO trainings (user_id, title, description, category, status, progress, duration, url, completed_at, created_by, updated_by)
    SELECT 
      p.id,
      training_data.title,
      training_data.description,
      training_data.category,
      (ARRAY['not-started', 'in-progress', 'completed'])[FLOOR(RANDOM() * 3 + 1)::INTEGER]::training_status,
      FLOOR(RANDOM() * 100)::INTEGER,
      FLOOR(RANDOM() * 20 + 5)::INTEGER * 60, -- 5-25 hours in minutes
      'https://training.example.com/' || LOWER(REPLACE(training_data.title, ' ', '-')),
      CASE WHEN RANDOM() > 0.6 THEN CURRENT_DATE - (RANDOM() * 60)::INTEGER ELSE NULL END,
      v_superadmin_id,
      v_superadmin_id
    FROM profiles p
    CROSS JOIN (
      VALUES 
        ('React Fundamentals', 'Learn React basics', 'Development'),
        ('Project Management', 'PM best practices', 'Management'),
        ('Security Awareness', 'Security training', 'Security'),
        ('Communication Skills', 'Improve communication', 'Soft Skills'),
        ('Database Design', 'Database concepts', 'Technical')
    ) AS training_data(title, description, category)
    WHERE p.is_active = true
      AND p.id = ANY(v_profile_ids)
    LIMIT 25;
    RAISE NOTICE 'Seeded trainings table';
  ELSE
    RAISE NOTICE 'Skipping trainings table (already has data or missing dependencies)';
  END IF;
  
  -- ============================================================================
  -- PHASE 9: Job Listings (job_posting_portals, job_listings)
  -- ============================================================================
  
  -- Seed job_posting_portals
  SELECT COUNT(*) INTO v_count FROM job_posting_portals;
  IF v_count = 0 
    AND array_length(v_job_posting_ids, 1) > 0 
    AND array_length(v_job_portal_ids, 1) > 0 THEN
    INSERT INTO job_posting_portals (job_posting_id, job_portal_id, external_id, posted_at, expires_at, created_by, updated_by)
    SELECT 
      jp.id,
      jport.id,
      'EXT-' || jp.id::TEXT || '-' || jport.id::TEXT,
      CURRENT_DATE - (RANDOM() * 30)::INTEGER, -- Last 30 days
      CURRENT_DATE + (RANDOM() * 60)::INTEGER, -- Next 60 days
      v_superadmin_id,
      v_superadmin_id
    FROM job_postings jp
    CROSS JOIN job_portals jport
    WHERE jp.deleted_at IS NULL
      AND jp.id = ANY(v_job_posting_ids)
      AND jport.id = ANY(v_job_portal_ids)
    LIMIT 10;
    RAISE NOTICE 'Seeded job_posting_portals table';
  ELSE
    RAISE NOTICE 'Skipping job_posting_portals table (already has data or missing dependencies)';
  END IF;
  
  -- Seed job_listings
  SELECT COUNT(*) INTO v_count FROM job_listings;
  IF v_count = 0 
    AND array_length(v_job_role_ids, 1) > 0 
    AND array_length(v_job_portal_ids, 1) > 0 
    AND array_length(v_profile_ids, 1) > 0 THEN
    INSERT INTO job_listings (
      job_role_id, job_portal_id, portal_listing_url, portal_job_id, custom_title, 
      custom_jd, posted_date, expiry_date, status, views, applications_count, 
      notes, created_by, updated_by
    )
    SELECT 
      jr.id,
      jport.id,
      'https://portal.example.com/jobs/' || jr.id::TEXT,
      'PORTAL-' || jr.id::TEXT,
      jr.title || ' - ' || jport.name,
      'Custom job description for ' || jport.name,
      CURRENT_DATE - (RANDOM() * 30)::INTEGER, -- Last 30 days
      CURRENT_DATE + (RANDOM() * 60)::INTEGER, -- Next 60 days
      (ARRAY['draft', 'active', 'paused', 'expired', 'closed', 'filled'])[FLOOR(RANDOM() * 6 + 1)::INTEGER]::job_listing_status,
      FLOOR(RANDOM() * 500)::INTEGER,
      FLOOR(RANDOM() * 20)::INTEGER,
      'Listing notes',
      v_superadmin_id,
      v_superadmin_id
    FROM job_roles jr
    CROSS JOIN job_portals jport
    WHERE jr.deleted_at IS NULL
      AND jr.id = ANY(v_job_role_ids)
      AND jport.id = ANY(v_job_portal_ids)
    LIMIT 8;
    RAISE NOTICE 'Seeded job_listings table';
  ELSE
    RAISE NOTICE 'Skipping job_listings table (already has data or missing dependencies)';
  END IF;
  
  -- ============================================================================
  -- PHASE 10: Polymorphic Tables (addresses, phone_numbers)
  -- ============================================================================
  
  -- Seed addresses
  SELECT COUNT(*) INTO v_count FROM addresses;
  IF v_count = 0 THEN
    INSERT INTO addresses (entity_type, entity_id, type, line1, line2, city, state, postal_code, country, is_primary, created_by, updated_by)
    SELECT 
      'organization',
      o.id,
      'primary',
      (RANDOM() * 1000)::INTEGER || ' Main Street',
      CASE WHEN RANDOM() > 0.5 THEN 'Suite ' || (RANDOM() * 100)::INTEGER ELSE NULL END,
      (ARRAY['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'])[FLOOR(RANDOM() * 5 + 1)::INTEGER],
      (ARRAY['NY', 'CA', 'IL', 'TX', 'AZ'])[FLOOR(RANDOM() * 5 + 1)::INTEGER],
      LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),
      'USA',
      true,
      v_superadmin_id,
      v_superadmin_id
    FROM organizations o
    LIMIT 4;
    
    INSERT INTO addresses (entity_type, entity_id, type, line1, city, state, postal_code, country, is_primary, created_by, updated_by)
    SELECT 
      'contact',
      c.id,
      'primary',
      (RANDOM() * 1000)::INTEGER || ' Business Ave',
      (ARRAY['San Francisco', 'Seattle', 'Boston', 'Austin', 'Denver'])[FLOOR(RANDOM() * 5 + 1)::INTEGER],
      (ARRAY['CA', 'WA', 'MA', 'TX', 'CO'])[FLOOR(RANDOM() * 5 + 1)::INTEGER],
      LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),
      'USA',
      true,
      v_superadmin_id,
      v_superadmin_id
    FROM contacts c
    WHERE c.deleted_at IS NULL
    LIMIT 5;
    
    RAISE NOTICE 'Seeded addresses table';
  ELSE
    RAISE NOTICE 'Skipping addresses table (already has data)';
  END IF;
  
  -- Seed phone_numbers
  SELECT COUNT(*) INTO v_count FROM phone_numbers;
  IF v_count = 0 THEN
    INSERT INTO phone_numbers (entity_type, entity_id, type, number, is_primary, created_by, updated_by)
    SELECT 
      'organization',
      o.id,
      'office',
      '+1-555-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
      true,
      v_superadmin_id,
      v_superadmin_id
    FROM organizations o
    LIMIT 4;
    
    INSERT INTO phone_numbers (entity_type, entity_id, type, number, is_primary, created_by, updated_by)
    SELECT 
      'contact',
      c.id,
      (ARRAY['mobile', 'office', 'home'])[FLOOR(RANDOM() * 3 + 1)::INTEGER],
      '+1-555-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
      true,
      v_superadmin_id,
      v_superadmin_id
    FROM contacts c
    WHERE c.deleted_at IS NULL
    LIMIT 5;
    
    RAISE NOTICE 'Seeded phone_numbers table';
  ELSE
    RAISE NOTICE 'Skipping phone_numbers table (already has data)';
  END IF;
  
  RAISE NOTICE 'Database seeding completed successfully!';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error during seeding: %', SQLERRM;
    RAISE;
END $$;


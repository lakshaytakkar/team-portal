-- Seed HR Templates
-- This script inserts sample template data into the hr_templates table
-- Run this after the migration has been applied

-- Get a user ID for created_by (using the first active profile)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM profiles WHERE is_active = true LIMIT 1;
  
  -- Only insert if templates don't already exist
  IF NOT EXISTS (SELECT 1 FROM hr_templates WHERE deleted_at IS NULL LIMIT 1) THEN
    
    -- Message Templates
    INSERT INTO hr_templates (name, type, category, description, content, variables, is_active, created_by, updated_by)
    VALUES
    ('Welcome Email Template', 'message', 'onboarding', 'Welcome email sent to new employees on their first day', 
    'Subject: Welcome to {{company_name}}, {{employee_name}}!

Dear {{employee_name}},

Welcome to {{company_name}}! We''re thrilled to have you join our team as {{position}}.

Your first day is scheduled for {{start_date}}. Please arrive at {{office_location}} at {{start_time}}.

Here''s what to expect:
- Orientation session with HR
- Introduction to your team
- Workspace setup
- Company overview

If you have any questions before your start date, please don''t hesitate to reach out to {{hr_contact}}.

Looking forward to working with you!

Best regards,
{{hr_name}}
Human Resources',
    '{"company_name": "Company Name", "employee_name": "Employee Name", "position": "Position", "start_date": "Start Date", "office_location": "Office Location", "start_time": "Start Time", "hr_contact": "HR Contact", "hr_name": "HR Name"}'::jsonb,
    true, v_user_id, v_user_id),
    
    ('Onboarding Reminder Email', 'message', 'onboarding', 'Reminder email for pending onboarding tasks',
    'Subject: Reminder: Complete Your Onboarding Tasks

Hi {{employee_name}},

This is a friendly reminder that you have {{pending_tasks_count}} pending onboarding task(s) to complete.

Pending Tasks:
{{pending_tasks_list}}

Please complete these tasks by {{due_date}} to ensure a smooth onboarding process.

If you need assistance, please contact {{hr_contact}}.

Thank you,
HR Team',
    '{"employee_name": "Employee Name", "pending_tasks_count": "Pending Tasks Count", "pending_tasks_list": "Pending Tasks List", "due_date": "Due Date", "hr_contact": "HR Contact"}'::jsonb,
    true, v_user_id, v_user_id),
    
    ('Performance Review Notification', 'message', 'review', 'Notification email for upcoming performance reviews',
    'Subject: Performance Review Scheduled - {{review_period}}

Dear {{employee_name}},

Your performance review for {{review_period}} has been scheduled.

Review Details:
- Date: {{review_date}}
- Time: {{review_time}}
- Reviewer: {{reviewer_name}}
- Location: {{review_location}}

Please prepare:
- Self-assessment form (if applicable)
- List of achievements and goals
- Questions or concerns

If you need to reschedule, please contact {{reviewer_email}} at least 48 hours in advance.

Best regards,
{{reviewer_name}}',
    '{"employee_name": "Employee Name", "review_period": "Review Period", "review_date": "Review Date", "review_time": "Review Time", "reviewer_name": "Reviewer Name", "review_location": "Review Location", "reviewer_email": "Reviewer Email"}'::jsonb,
    true, v_user_id, v_user_id),
    
    ('Exit Interview Invitation', 'message', 'exit', 'Invitation email for exit interviews',
    'Subject: Exit Interview Invitation

Dear {{employee_name}},

As part of our standard process, we would like to schedule an exit interview with you.

Your last day: {{last_day}}
Exit Interview Date: {{interview_date}}
Time: {{interview_time}}
Location: {{interview_location}}

The purpose of this interview is to:
- Gather feedback about your experience
- Understand reasons for departure
- Identify areas for improvement

Please confirm your availability or suggest an alternative time by replying to this email.

Thank you for your contributions to {{company_name}}.

Best regards,
{{hr_name}}
Human Resources',
    '{"employee_name": "Employee Name", "last_day": "Last Day", "interview_date": "Interview Date", "interview_time": "Interview Time", "interview_location": "Interview Location", "company_name": "Company Name", "hr_name": "HR Name"}'::jsonb,
    true, v_user_id, v_user_id),
    
    ('Policy Update Notification', 'message', 'compliance', 'Notification email for policy updates',
    'Subject: Important: {{policy_name}} Policy Update

Dear Team,

We''re writing to inform you of an important update to our {{policy_name}} policy.

Effective Date: {{effective_date}}

Key Changes:
{{policy_changes}}

Please review the updated policy document: {{policy_link}}

All employees are required to acknowledge receipt of this policy update by {{acknowledgment_deadline}}.

If you have any questions, please contact {{hr_contact}}.

Thank you,
{{hr_name}}
Human Resources',
    '{"policy_name": "Policy Name", "effective_date": "Effective Date", "policy_changes": "Policy Changes", "policy_link": "Policy Link", "acknowledgment_deadline": "Acknowledgment Deadline", "hr_contact": "HR Contact", "hr_name": "HR Name"}'::jsonb,
    true, v_user_id, v_user_id);
    
    -- Form Templates (continuing in next batch due to size)
    INSERT INTO hr_templates (name, type, category, description, content, variables, is_active, created_by, updated_by)
    VALUES
    ('Employee Onboarding Form', 'form', 'onboarding', 'Comprehensive onboarding form for new employees',
    'Employee Onboarding Form

Employee Information:
- Full Name: {{employee_name}}
- Employee ID: {{employee_id}}
- Email: {{email}}
- Phone: {{phone}}
- Start Date: {{start_date}}
- Department: {{department}}
- Position: {{position}}

Personal Information:
- Emergency Contact Name: {{emergency_contact_name}}
- Emergency Contact Phone: {{emergency_contact_phone}}
- Emergency Contact Relationship: {{emergency_contact_relationship}}

Documentation Checklist:
☐ Signed Employment Contract
☐ Completed Tax Forms (W-4, etc.)
☐ Direct Deposit Information
☐ Benefits Enrollment Forms
☐ ID Verification Documents
☐ Background Check Completed
☐ Signed Code of Conduct
☐ Signed Confidentiality Agreement

Equipment & Access:
☐ Laptop/Computer Assigned
☐ Email Account Created
☐ System Access Granted
☐ Office Keys/Badge Issued
☐ Parking Permit (if applicable)

Orientation Checklist:
☐ HR Orientation Completed
☐ Department Introduction Completed
☐ Workspace Setup Completed
☐ System Training Completed

Employee Signature: _________________ Date: {{signature_date}}
HR Representative: {{hr_name}} Date: {{hr_date}}',
    '{"employee_name": "Employee Name", "employee_id": "Employee ID", "email": "Email", "phone": "Phone", "start_date": "Start Date", "department": "Department", "position": "Position", "emergency_contact_name": "Emergency Contact Name", "emergency_contact_phone": "Emergency Contact Phone", "emergency_contact_relationship": "Emergency Contact Relationship", "signature_date": "Signature Date", "hr_name": "HR Name", "hr_date": "HR Date"}'::jsonb,
    true, v_user_id, v_user_id);
    
    -- Continue with remaining templates...
    -- Note: Due to SQL query size limits, remaining templates should be inserted in separate batches
    -- or use the seed script function from the application
    
  END IF;
END $$;


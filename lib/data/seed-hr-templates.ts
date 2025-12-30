/**
 * Seed data for HR templates
 * Sample templates for Message Templates, Form Templates, Policy Templates, and Printables
 */

import type { HRTemplate } from '@/lib/types/hr'

export interface SeedHRTemplate {
  name: string
  type: HRTemplate['type']
  category: string
  description?: string
  content: string
  variables?: Record<string, string>
  isActive: boolean
}

export const seedHRTemplates: SeedHRTemplate[] = [
  // Message Templates
  {
    name: 'Welcome Email Template',
    type: 'message',
    category: 'onboarding',
    description: 'Welcome email sent to new employees on their first day',
    content: `Subject: Welcome to {{company_name}}, {{employee_name}}!

Dear {{employee_name}},

Welcome to {{company_name}}! We're thrilled to have you join our team as {{position}}.

Your first day is scheduled for {{start_date}}. Please arrive at {{office_location}} at {{start_time}}.

Here's what to expect:
- Orientation session with HR
- Introduction to your team
- Workspace setup
- Company overview

If you have any questions before your start date, please don't hesitate to reach out to {{hr_contact}}.

Looking forward to working with you!

Best regards,
{{hr_name}}
Human Resources`,
    variables: {
      company_name: 'Company Name',
      employee_name: 'Employee Name',
      position: 'Position',
      start_date: 'Start Date',
      office_location: 'Office Location',
      start_time: 'Start Time',
      hr_contact: 'HR Contact',
      hr_name: 'HR Name',
    },
    isActive: true,
  },
  {
    name: 'Onboarding Reminder Email',
    type: 'message',
    category: 'onboarding',
    description: 'Reminder email for pending onboarding tasks',
    content: `Subject: Reminder: Complete Your Onboarding Tasks

Hi {{employee_name}},

This is a friendly reminder that you have {{pending_tasks_count}} pending onboarding task(s) to complete.

Pending Tasks:
{{pending_tasks_list}}

Please complete these tasks by {{due_date}} to ensure a smooth onboarding process.

If you need assistance, please contact {{hr_contact}}.

Thank you,
HR Team`,
    variables: {
      employee_name: 'Employee Name',
      pending_tasks_count: 'Pending Tasks Count',
      pending_tasks_list: 'Pending Tasks List',
      due_date: 'Due Date',
      hr_contact: 'HR Contact',
    },
    isActive: true,
  },
  {
    name: 'Performance Review Notification',
    type: 'message',
    category: 'review',
    description: 'Notification email for upcoming performance reviews',
    content: `Subject: Performance Review Scheduled - {{review_period}}

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
{{reviewer_name}}`,
    variables: {
      employee_name: 'Employee Name',
      review_period: 'Review Period',
      review_date: 'Review Date',
      review_time: 'Review Time',
      reviewer_name: 'Reviewer Name',
      review_location: 'Review Location',
      reviewer_email: 'Reviewer Email',
    },
    isActive: true,
  },
  {
    name: 'Exit Interview Invitation',
    type: 'message',
    category: 'exit',
    description: 'Invitation email for exit interviews',
    content: `Subject: Exit Interview Invitation

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
Human Resources`,
    variables: {
      employee_name: 'Employee Name',
      last_day: 'Last Day',
      interview_date: 'Interview Date',
      interview_time: 'Interview Time',
      interview_location: 'Interview Location',
      company_name: 'Company Name',
      hr_name: 'HR Name',
    },
    isActive: true,
  },
  {
    name: 'Policy Update Notification',
    type: 'message',
    category: 'compliance',
    description: 'Notification email for policy updates',
    content: `Subject: Important: {{policy_name}} Policy Update

Dear Team,

We're writing to inform you of an important update to our {{policy_name}} policy.

Effective Date: {{effective_date}}

Key Changes:
{{policy_changes}}

Please review the updated policy document: {{policy_link}}

All employees are required to acknowledge receipt of this policy update by {{acknowledgment_deadline}}.

If you have any questions, please contact {{hr_contact}}.

Thank you,
{{hr_name}}
Human Resources`,
    variables: {
      policy_name: 'Policy Name',
      effective_date: 'Effective Date',
      policy_changes: 'Policy Changes',
      policy_link: 'Policy Link',
      acknowledgment_deadline: 'Acknowledgment Deadline',
      hr_contact: 'HR Contact',
      hr_name: 'HR Name',
    },
    isActive: true,
  },

  // Form Templates
  {
    name: 'Employee Onboarding Form',
    type: 'form',
    category: 'onboarding',
    description: 'Comprehensive onboarding form for new employees',
    content: `Employee Onboarding Form

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
HR Representative: {{hr_name}} Date: {{hr_date}}`,
    variables: {
      employee_name: 'Employee Name',
      employee_id: 'Employee ID',
      email: 'Email',
      phone: 'Phone',
      start_date: 'Start Date',
      department: 'Department',
      position: 'Position',
      emergency_contact_name: 'Emergency Contact Name',
      emergency_contact_phone: 'Emergency Contact Phone',
      emergency_contact_relationship: 'Emergency Contact Relationship',
      signature_date: 'Signature Date',
      hr_name: 'HR Name',
      hr_date: 'HR Date',
    },
    isActive: true,
  },
  {
    name: 'Exit Interview Form',
    type: 'form',
    category: 'exit',
    description: 'Exit interview form for departing employees',
    content: `Exit Interview Form

Employee Information:
- Name: {{employee_name}}
- Employee ID: {{employee_id}}
- Department: {{department}}
- Position: {{position}}
- Last Day: {{last_day}}
- Interview Date: {{interview_date}}

Reason for Leaving:
{{reason_for_leaving}}

What did you like most about working here?
{{liked_most}}

What did you like least about working here?
{{liked_least}}

What could we have done differently to retain you?
{{retention_suggestions}}

Rate your overall experience (1-10): {{experience_rating}}

Would you recommend {{company_name}} as a place to work? {{recommendation}}

Additional Comments:
{{additional_comments}}

Employee Signature: _________________ Date: {{signature_date}}
HR Representative: {{hr_name}} Date: {{hr_date}}`,
    variables: {
      employee_name: 'Employee Name',
      employee_id: 'Employee ID',
      department: 'Department',
      position: 'Position',
      last_day: 'Last Day',
      interview_date: 'Interview Date',
      reason_for_leaving: 'Reason for Leaving',
      liked_most: 'Liked Most',
      liked_least: 'Liked Least',
      retention_suggestions: 'Retention Suggestions',
      experience_rating: 'Experience Rating',
      company_name: 'Company Name',
      recommendation: 'Recommendation',
      additional_comments: 'Additional Comments',
      signature_date: 'Signature Date',
      hr_name: 'HR Name',
      hr_date: 'HR Date',
    },
    isActive: true,
  },
  {
    name: 'Performance Review Form',
    type: 'form',
    category: 'review',
    description: 'Performance review form for employee evaluations',
    content: `Performance Review Form

Review Period: {{review_period}}
Employee: {{employee_name}}
Position: {{position}}
Department: {{department}}
Reviewer: {{reviewer_name}}
Review Date: {{review_date}}

1. Job Performance
Rate the employee's performance in their current role:
{{performance_rating}}

Key Achievements:
{{key_achievements}}

Areas for Improvement:
{{improvement_areas}}

2. Goals & Objectives
Goals Met: {{goals_met}}
Goals Partially Met: {{goals_partial}}
Goals Not Met: {{goals_not_met}}

3. Skills & Competencies
Technical Skills: {{technical_skills_rating}}
Communication: {{communication_rating}}
Teamwork: {{teamwork_rating}}
Leadership: {{leadership_rating}}

4. Development Plan
Training Needs: {{training_needs}}
Career Goals: {{career_goals}}
Action Items: {{action_items}}

5. Overall Rating: {{overall_rating}}

Employee Comments:
{{employee_comments}}

Employee Signature: _________________ Date: {{employee_signature_date}}
Reviewer Signature: _________________ Date: {{reviewer_signature_date}}`,
    variables: {
      review_period: 'Review Period',
      employee_name: 'Employee Name',
      position: 'Position',
      department: 'Department',
      reviewer_name: 'Reviewer Name',
      review_date: 'Review Date',
      performance_rating: 'Performance Rating',
      key_achievements: 'Key Achievements',
      improvement_areas: 'Improvement Areas',
      goals_met: 'Goals Met',
      goals_partial: 'Goals Partially Met',
      goals_not_met: 'Goals Not Met',
      technical_skills_rating: 'Technical Skills Rating',
      communication_rating: 'Communication Rating',
      teamwork_rating: 'Teamwork Rating',
      leadership_rating: 'Leadership Rating',
      training_needs: 'Training Needs',
      career_goals: 'Career Goals',
      action_items: 'Action Items',
      overall_rating: 'Overall Rating',
      employee_comments: 'Employee Comments',
      employee_signature_date: 'Employee Signature Date',
      reviewer_signature_date: 'Reviewer Signature Date',
    },
    isActive: true,
  },
  {
    name: 'Training Feedback Form',
    type: 'form',
    category: 'training',
    description: 'Feedback form for training sessions',
    content: `Training Feedback Form

Training Information:
- Training Name: {{training_name}}
- Trainer: {{trainer_name}}
- Date: {{training_date}}
- Duration: {{training_duration}}
- Participant: {{participant_name}}

1. Overall Rating (1-5): {{overall_rating}}

2. Content Quality
- Relevance: {{relevance_rating}}
- Clarity: {{clarity_rating}}
- Depth: {{depth_rating}}

3. Trainer Evaluation
- Knowledge: {{trainer_knowledge_rating}}
- Presentation: {{presentation_rating}}
- Engagement: {{engagement_rating}}

4. What did you find most valuable?
{{most_valuable}}

5. What could be improved?
{{improvements}}

6. Would you recommend this training to others? {{recommendation}}

7. Additional Comments:
{{additional_comments}}

Participant Signature: _________________ Date: {{signature_date}}`,
    variables: {
      training_name: 'Training Name',
      trainer_name: 'Trainer Name',
      training_date: 'Training Date',
      training_duration: 'Training Duration',
      participant_name: 'Participant Name',
      overall_rating: 'Overall Rating',
      relevance_rating: 'Relevance Rating',
      clarity_rating: 'Clarity Rating',
      depth_rating: 'Depth Rating',
      trainer_knowledge_rating: 'Trainer Knowledge Rating',
      presentation_rating: 'Presentation Rating',
      engagement_rating: 'Engagement Rating',
      most_valuable: 'Most Valuable',
      improvements: 'Improvements',
      recommendation: 'Recommendation',
      additional_comments: 'Additional Comments',
      signature_date: 'Signature Date',
    },
    isActive: true,
  },
  {
    name: 'Incident Report Form',
    type: 'form',
    category: 'compliance',
    description: 'Form for reporting workplace incidents',
    content: `Incident Report Form

Incident Information:
- Date of Incident: {{incident_date}}
- Time of Incident: {{incident_time}}
- Location: {{incident_location}}
- Reported By: {{reported_by}}
- Report Date: {{report_date}}

Incident Description:
{{incident_description}}

People Involved:
{{people_involved}}

Witnesses:
{{witnesses}}

Injuries or Damage:
{{injuries_damage}}

Immediate Actions Taken:
{{immediate_actions}}

Preventive Measures:
{{preventive_measures}}

Reported By Signature: _________________ Date: {{signature_date}}
Supervisor Review: {{supervisor_name}} Date: {{supervisor_date}}
HR Review: {{hr_name}} Date: {{hr_date}}`,
    variables: {
      incident_date: 'Incident Date',
      incident_time: 'Incident Time',
      incident_location: 'Incident Location',
      reported_by: 'Reported By',
      report_date: 'Report Date',
      incident_description: 'Incident Description',
      people_involved: 'People Involved',
      witnesses: 'Witnesses',
      injuries_damage: 'Injuries or Damage',
      immediate_actions: 'Immediate Actions Taken',
      preventive_measures: 'Preventive Measures',
      signature_date: 'Signature Date',
      supervisor_name: 'Supervisor Name',
      supervisor_date: 'Supervisor Date',
      hr_name: 'HR Name',
      hr_date: 'HR Date',
    },
    isActive: true,
  },

  // Policy Templates
  {
    name: 'Code of Conduct Policy',
    type: 'policy',
    category: 'compliance',
    description: 'Company code of conduct and ethics policy',
    content: `CODE OF CONDUCT POLICY

Effective Date: {{effective_date}}
Last Updated: {{last_updated}}

1. INTRODUCTION
{{company_name}} is committed to maintaining the highest standards of ethical conduct. This Code of Conduct applies to all employees, contractors, and representatives.

2. STANDARDS OF CONDUCT
- Professionalism and respect in all interactions
- Honesty and integrity in business dealings
- Compliance with all applicable laws and regulations
- Protection of company assets and confidential information
- Fair treatment of colleagues, customers, and partners

3. WORKPLACE BEHAVIOR
- Zero tolerance for harassment, discrimination, or bullying
- Respectful communication at all times
- Appropriate use of company resources
- Compliance with health and safety regulations

4. CONFLICTS OF INTEREST
Employees must avoid situations where personal interests conflict with company interests. All potential conflicts must be disclosed to management.

5. CONFIDENTIALITY
All employees must protect confidential information, including:
- Customer data
- Financial information
- Trade secrets
- Employee information

6. REPORTING VIOLATIONS
Violations of this code should be reported to {{reporting_contact}} or through {{reporting_channel}}.

7. CONSEQUENCES
Violations may result in disciplinary action, up to and including termination.

Acknowledgment Required: All employees must acknowledge receipt and understanding of this policy.

{{company_name}}
Human Resources Department`,
    variables: {
      effective_date: 'Effective Date',
      last_updated: 'Last Updated',
      company_name: 'Company Name',
      reporting_contact: 'Reporting Contact',
      reporting_channel: 'Reporting Channel',
    },
    isActive: true,
  },
  {
    name: 'Remote Work Policy',
    type: 'policy',
    category: 'compliance',
    description: 'Policy governing remote work arrangements',
    content: `REMOTE WORK POLICY

Effective Date: {{effective_date}}
Last Updated: {{last_updated}}

1. PURPOSE
This policy establishes guidelines for remote work arrangements at {{company_name}}.

2. ELIGIBILITY
Remote work eligibility is determined by:
- Job function requirements
- Performance history
- Manager approval
- Business needs

3. WORK SCHEDULE
- Standard work hours: {{standard_hours}}
- Availability requirements: {{availability_requirements}}
- Time zone considerations: {{timezone_considerations}}

4. WORKSPACE REQUIREMENTS
- Secure, private workspace
- Reliable internet connection (minimum {{internet_speed}})
- Required equipment: {{required_equipment}}
- Data security measures

5. COMMUNICATION EXPECTATIONS
- Regular check-ins with manager
- Response time expectations: {{response_time}}
- Use of company communication tools
- Participation in team meetings

6. PERFORMANCE STANDARDS
Remote employees are held to the same performance standards as office-based employees.

7. EQUIPMENT & EXPENSES
- Company-provided equipment: {{company_equipment}}
- Reimbursable expenses: {{reimbursable_expenses}}
- Equipment return upon termination

8. TERMINATION OF REMOTE WORK
Remote work arrangements may be modified or terminated based on business needs or performance.

{{company_name}}
Human Resources Department`,
    variables: {
      effective_date: 'Effective Date',
      last_updated: 'Last Updated',
      company_name: 'Company Name',
      standard_hours: 'Standard Work Hours',
      availability_requirements: 'Availability Requirements',
      timezone_considerations: 'Timezone Considerations',
      internet_speed: 'Internet Speed',
      required_equipment: 'Required Equipment',
      response_time: 'Response Time',
      company_equipment: 'Company Equipment',
      reimbursable_expenses: 'Reimbursable Expenses',
    },
    isActive: true,
  },
  {
    name: 'Leave Policy',
    type: 'policy',
    category: 'compliance',
    description: 'Employee leave and time-off policy',
    content: `LEAVE POLICY

Effective Date: {{effective_date}}
Last Updated: {{last_updated}}

1. TYPES OF LEAVE
- Annual Leave: {{annual_leave_days}} days per year
- Sick Leave: {{sick_leave_days}} days per year
- Personal Leave: {{personal_leave_days}} days per year
- Maternity/Paternity Leave: {{parental_leave_days}} days
- Bereavement Leave: {{bereavement_leave_days}} days

2. ACCRUAL RATES
- Full-time employees: {{fulltime_accrual_rate}}
- Part-time employees: {{parttime_accrual_rate}}
- Maximum accrual: {{max_accrual}} days

3. REQUEST PROCEDURE
- Submit request through {{request_system}}
- Minimum advance notice: {{advance_notice}}
- Manager approval required
- Confirmation received within {{confirmation_timeframe}}

4. APPROVAL CRITERIA
- Business needs
- Team coverage
- Leave balance availability
- Peak period restrictions

5. CARRYOVER & PAYOUT
- Maximum carryover: {{max_carryover}} days
- Payout upon termination: {{payout_policy}}

6. EMERGENCY LEAVE
Emergency leave may be granted with manager approval, even if advance notice is not possible.

7. DOCUMENTATION
Medical certificates required for sick leave exceeding {{sick_leave_certificate_days}} consecutive days.

{{company_name}}
Human Resources Department`,
    variables: {
      effective_date: 'Effective Date',
      last_updated: 'Last Updated',
      annual_leave_days: 'Annual Leave Days',
      sick_leave_days: 'Sick Leave Days',
      personal_leave_days: 'Personal Leave Days',
      parental_leave_days: 'Parental Leave Days',
      bereavement_leave_days: 'Bereavement Leave Days',
      fulltime_accrual_rate: 'Full-time Accrual Rate',
      parttime_accrual_rate: 'Part-time Accrual Rate',
      max_accrual: 'Maximum Accrual',
      request_system: 'Request System',
      advance_notice: 'Advance Notice',
      confirmation_timeframe: 'Confirmation Timeframe',
      max_carryover: 'Maximum Carryover',
      payout_policy: 'Payout Policy',
      sick_leave_certificate_days: 'Sick Leave Certificate Days',
      company_name: 'Company Name',
    },
    isActive: true,
  },
  {
    name: 'Data Security Policy',
    type: 'policy',
    category: 'compliance',
    description: 'Data security and privacy policy',
    content: `DATA SECURITY POLICY

Effective Date: {{effective_date}}
Last Updated: {{last_updated}}

1. PURPOSE
This policy establishes guidelines for protecting {{company_name}}'s data and information assets.

2. SCOPE
Applies to all employees, contractors, and third parties with access to company data.

3. DATA CLASSIFICATION
- Public: Information that can be freely shared
- Internal: Information for internal use only
- Confidential: Sensitive information requiring protection
- Restricted: Highly sensitive information with strict access controls

4. ACCESS CONTROL
- Unique user accounts required
- Strong password requirements: {{password_requirements}}
- Multi-factor authentication: {{mfa_requirements}}
- Regular access reviews

5. DATA HANDLING
- Encryption requirements: {{encryption_requirements}}
- Secure transmission protocols
- Prohibited storage locations: {{prohibited_storage}}
- Data retention policies: {{retention_policy}}

6. DEVICE SECURITY
- Company devices: {{company_device_requirements}}
- Personal devices (BYOD): {{byod_requirements}}
- Software installation restrictions
- Regular security updates

7. INCIDENT REPORTING
Data breaches or security incidents must be reported immediately to {{security_contact}}.

8. COMPLIANCE
All employees must comply with:
- {{applicable_regulations}}
- This policy
- Related security procedures

9. CONSEQUENCES
Violations may result in disciplinary action and legal consequences.

{{company_name}}
IT Security & Human Resources`,
    variables: {
      effective_date: 'Effective Date',
      last_updated: 'Last Updated',
      company_name: 'Company Name',
      password_requirements: 'Password Requirements',
      mfa_requirements: 'MFA Requirements',
      encryption_requirements: 'Encryption Requirements',
      prohibited_storage: 'Prohibited Storage',
      retention_policy: 'Retention Policy',
      company_device_requirements: 'Company Device Requirements',
      byod_requirements: 'BYOD Requirements',
      security_contact: 'Security Contact',
      applicable_regulations: 'Applicable Regulations',
    },
    isActive: true,
  },
  {
    name: 'Anti-Harassment Policy',
    type: 'policy',
    category: 'compliance',
    description: 'Anti-harassment and anti-discrimination policy',
    content: `ANTI-HARASSMENT POLICY

Effective Date: {{effective_date}}
Last Updated: {{last_updated}}

1. COMMITMENT
{{company_name}} is committed to providing a workplace free from harassment, discrimination, and retaliation.

2. PROHIBITED CONDUCT
Prohibited conduct includes:
- Harassment based on protected characteristics
- Sexual harassment
- Discriminatory treatment
- Retaliation against complainants
- Hostile work environment

3. PROTECTED CHARACTERISTICS
- Race, color, ethnicity
- Religion, creed
- National origin
- Age
- Sex, gender, gender identity
- Sexual orientation
- Disability
- Veteran status

4. REPORTING PROCEDURES
Reports can be made to:
- Immediate supervisor
- HR Department: {{hr_contact}}
- Anonymous reporting: {{anonymous_channel}}

5. INVESTIGATION PROCESS
- Prompt investigation of all complaints
- Confidentiality maintained to extent possible
- Fair and impartial process
- Timely resolution

6. REMEDIAL ACTION
Appropriate action may include:
- Training or counseling
- Disciplinary action
- Transfer or reassignment
- Termination

7. RETALIATION PROHIBITED
Retaliation against individuals who report harassment or participate in investigations is strictly prohibited.

8. TRAINING
All employees receive regular training on this policy.

{{company_name}}
Human Resources Department`,
    variables: {
      effective_date: 'Effective Date',
      last_updated: 'Last Updated',
      company_name: 'Company Name',
      hr_contact: 'HR Contact',
      anonymous_channel: 'Anonymous Reporting Channel',
    },
    isActive: true,
  },

  // Printables
  {
    name: 'Employee ID Card Template',
    type: 'printable',
    category: 'onboarding',
    description: 'Template for employee identification cards',
    content: `EMPLOYEE ID CARD

{{company_name}}
{{company_logo}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Employee Name: {{employee_name}}
Employee ID: {{employee_id}}
Department: {{department}}
Position: {{position}}
Issue Date: {{issue_date}}
Expiry Date: {{expiry_date}}

Photo: [Employee Photo]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Authorized Signature: {{authorized_signature}}
Date: {{signature_date}}

This card is the property of {{company_name}} and must be returned upon termination.`,
    variables: {
      company_name: 'Company Name',
      company_logo: 'Company Logo',
      employee_name: 'Employee Name',
      employee_id: 'Employee ID',
      department: 'Department',
      position: 'Position',
      issue_date: 'Issue Date',
      expiry_date: 'Expiry Date',
      authorized_signature: 'Authorized Signature',
      signature_date: 'Signature Date',
    },
    isActive: true,
  },
  {
    name: 'Certificate of Completion',
    type: 'printable',
    category: 'training',
    description: 'Certificate template for training completion',
    content: `CERTIFICATE OF COMPLETION

This certifies that

{{participant_name}}

has successfully completed

{{training_name}}

Duration: {{training_duration}}
Date: {{completion_date}}
Trainer: {{trainer_name}}

This certificate acknowledges the participant's commitment to professional development and successful completion of all required coursework and assessments.

Certificate ID: {{certificate_id}}

{{trainer_signature}}                    {{hr_signature}}
Trainer Signature                       HR Signature

Date: {{issue_date}}

{{company_name}}`,
    variables: {
      participant_name: 'Participant Name',
      training_name: 'Training Name',
      training_duration: 'Training Duration',
      completion_date: 'Completion Date',
      trainer_name: 'Trainer Name',
      certificate_id: 'Certificate ID',
      trainer_signature: 'Trainer Signature',
      hr_signature: 'HR Signature',
      issue_date: 'Issue Date',
      company_name: 'Company Name',
    },
    isActive: true,
  },
  {
    name: 'Offer Letter Template',
    type: 'printable',
    category: 'onboarding',
    description: 'Employment offer letter template',
    content: `OFFER OF EMPLOYMENT

Date: {{offer_date}}

{{candidate_name}}
{{candidate_address}}

Dear {{candidate_name}},

We are pleased to offer you the position of {{position}} at {{company_name}}.

POSITION DETAILS:
- Title: {{position}}
- Department: {{department}}
- Reports to: {{manager_name}}
- Start Date: {{start_date}}
- Employment Type: {{employment_type}}

COMPENSATION:
- Base Salary: {{base_salary}} per {{salary_period}}
- Benefits: {{benefits_summary}}
- Probation Period: {{probation_period}}

WORK SCHEDULE:
- Hours: {{work_hours}} per week
- Location: {{work_location}}
- Schedule: {{work_schedule}}

CONDITIONS OF EMPLOYMENT:
- Background check completion required
- Reference verification required
- Signed employment contract required
- Compliance with company policies required

This offer is contingent upon:
- Successful completion of background check
- Verification of references
- Signed acceptance by {{acceptance_deadline}}

We look forward to welcoming you to our team. Please confirm your acceptance by signing and returning this letter.

{{company_name}}
{{hr_name}}
Human Resources

Accepted by: _________________ Date: {{acceptance_date}}`,
    variables: {
      offer_date: 'Offer Date',
      candidate_name: 'Candidate Name',
      candidate_address: 'Candidate Address',
      position: 'Position',
      company_name: 'Company Name',
      department: 'Department',
      manager_name: 'Manager Name',
      start_date: 'Start Date',
      employment_type: 'Employment Type',
      base_salary: 'Base Salary',
      salary_period: 'Salary Period',
      benefits_summary: 'Benefits Summary',
      probation_period: 'Probation Period',
      work_hours: 'Work Hours',
      work_location: 'Work Location',
      work_schedule: 'Work Schedule',
      acceptance_deadline: 'Acceptance Deadline',
      hr_name: 'HR Name',
      acceptance_date: 'Acceptance Date',
    },
    isActive: true,
  },
  {
    name: 'Termination Letter Template',
    type: 'printable',
    category: 'exit',
    description: 'Employee termination letter template',
    content: `TERMINATION OF EMPLOYMENT

Date: {{termination_date}}

{{employee_name}}
{{employee_address}}

Dear {{employee_name}},

This letter confirms the termination of your employment with {{company_name}}.

TERMINATION DETAILS:
- Last Day of Employment: {{last_day}}
- Termination Type: {{termination_type}}
- Reason: {{termination_reason}}
- Effective Date: {{effective_date}}

FINAL PAYMENT:
- Final Paycheck: {{final_paycheck_date}}
- Accrued Leave Payout: {{leave_payout}}
- Benefits Continuation: {{benefits_continuation}}

RETURN OF COMPANY PROPERTY:
Please return the following items by {{return_deadline}}:
{{company_property_list}}

EXIT PROCESS:
- Exit Interview: {{exit_interview_date}}
- Final Payroll Processing: {{payroll_processing_date}}

We thank you for your service and wish you success in your future endeavors.

{{company_name}}
{{hr_name}}
Human Resources

Acknowledged by: _________________ Date: {{acknowledgment_date}}`,
    variables: {
      termination_date: 'Termination Date',
      employee_name: 'Employee Name',
      employee_address: 'Employee Address',
      company_name: 'Company Name',
      last_day: 'Last Day',
      termination_type: 'Termination Type',
      termination_reason: 'Termination Reason',
      effective_date: 'Effective Date',
      final_paycheck_date: 'Final Paycheck Date',
      leave_payout: 'Leave Payout',
      benefits_continuation: 'Benefits Continuation',
      return_deadline: 'Return Deadline',
      company_property_list: 'Company Property List',
      exit_interview_date: 'Exit Interview Date',
      payroll_processing_date: 'Payroll Processing Date',
      hr_name: 'HR Name',
      acknowledgment_date: 'Acknowledgment Date',
    },
    isActive: true,
  },
  {
    name: 'Reference Letter Template',
    type: 'printable',
    category: 'exit',
    description: 'Employee reference letter template',
    content: `REFERENCE LETTER

Date: {{letter_date}}

To Whom It May Concern:

This letter serves as a reference for {{employee_name}}, who was employed at {{company_name}} from {{start_date}} to {{end_date}}.

EMPLOYMENT DETAILS:
- Position: {{position}}
- Department: {{department}}
- Employment Type: {{employment_type}}
- Reason for Leaving: {{reason_for_leaving}}

PERFORMANCE SUMMARY:
{{performance_summary}}

KEY STRENGTHS:
{{key_strengths}}

CONTRIBUTIONS:
{{contributions}}

{{employee_name}} was a {{performance_adjective}} employee who {{performance_description}}.

We {{recommendation_statement}} {{employee_name}} for employment opportunities.

If you require additional information, please contact {{contact_name}} at {{contact_email}} or {{contact_phone}}.

Sincerely,

{{author_name}}
{{author_title}}
{{company_name}}
{{contact_email}}
{{contact_phone}}`,
    variables: {
      letter_date: 'Letter Date',
      employee_name: 'Employee Name',
      company_name: 'Company Name',
      start_date: 'Start Date',
      end_date: 'End Date',
      position: 'Position',
      department: 'Department',
      employment_type: 'Employment Type',
      reason_for_leaving: 'Reason for Leaving',
      performance_summary: 'Performance Summary',
      key_strengths: 'Key Strengths',
      contributions: 'Contributions',
      performance_adjective: 'Performance Adjective',
      performance_description: 'Performance Description',
      recommendation_statement: 'Recommendation Statement',
      contact_name: 'Contact Name',
      contact_email: 'Contact Email',
      contact_phone: 'Contact Phone',
      author_name: 'Author Name',
      author_title: 'Author Title',
    },
    isActive: true,
  },
]


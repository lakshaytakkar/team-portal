/**
 * Filter utility functions for contextual filter definitions
 * Returns available filters based on page, role, and department context
 */

import type { Role } from './permissions'
import { canViewTeamData, canViewAll } from './permissions'

export type FilterType = 'select' | 'multiselect' | 'daterange' | 'date' | 'text' | 'number'

export interface FilterOption {
  value: string
  label: string
}

export interface FilterDefinition {
  id: string
  label: string
  type: FilterType
  options?: FilterOption[]
  dependsOn?: string[]
  required?: boolean
  placeholder?: string
  defaultValue?: any
}

export interface FilterValue {
  [key: string]: any
}

/**
 * Get available filters for a page based on role and department
 */
export function getAvailableFilters(
  page: string,
  userRole: Role,
  userDepartment?: string
): FilterDefinition[] {
  if (page.includes('/projects')) {
    return getProjectFilters(userRole)
  } else if (page.includes('/tasks')) {
    return getTaskFilters(userRole)
  } else if (page.includes('/my-calls') || page.includes('/calls')) {
    return getCallFilters(userRole)
  } else if (page.includes('/my-attendance') || page.includes('/attendance')) {
    return getAttendanceFilters(userRole, userDepartment)
  } else if (page.includes('/admin/users')) {
    return getUserFilters(userRole)
  } else if (page.includes('/recruitment/job-listings')) {
    return getJobListingsFilters()
  } else if (page.includes('/recruitment/candidates')) {
    return getCandidatesFilters(userRole)
  } else if (page.includes('/recruitment/applications')) {
    return getApplicationsFilters()
  } else if (page.includes('/sales/leads')) {
    return getLeadsFilters(userRole)
  } else if (page.includes('/sales/deals')) {
    return getDealsFilters(userRole)
  } else if (page.includes('/sales/quotations')) {
    return getQuotationsFilters(userRole)
  } else if (page.includes('/finance/invoices')) {
    return getInvoicesFilters()
  } else if (page.includes('/finance/expenses')) {
    return getExpensesFilters(userRole)
  } else if (page.includes('/finance/transactions')) {
    return getTransactionsFilters()
  } else if (page.includes('/marketing/campaigns')) {
    return getCampaignsFilters()
  } else if (page.includes('/marketing/email-templates')) {
    return getEmailTemplatesFilters()
  } else if (page.includes('/hr/employees')) {
    return getEmployeesFilters(userRole)
  } else if (page.includes('/hr/onboarding')) {
    return getOnboardingFilters()
  }

  return []
}

// ==================== PROJECT FILTERS ====================

function getProjectFilters(userRole: Role): FilterDefinition[] {
  const filters: FilterDefinition[] = []

  // Status filter
  filters.push({
    id: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { value: 'planning', label: 'Planning' },
      { value: 'active', label: 'Active' },
      { value: 'on-hold', label: 'On Hold' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  })

  // Priority filter
  filters.push({
    id: 'priority',
    label: 'Priority',
    type: 'multiselect',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
  })

  // Owner filter (for managers and admins)
  if (canViewTeamData(userRole)) {
    filters.push({
      id: 'owner',
      label: 'Owner',
      type: 'multiselect',
      options: [], // Will be populated with actual users
    })
  }

  // Date range filters
  filters.push({
    id: 'startDate',
    label: 'Start Date',
    type: 'daterange',
  })

  filters.push({
    id: 'dueDate',
    label: 'Due Date',
    type: 'daterange',
  })

  // Search
  filters.push({
    id: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search projects...',
  })

  return filters
}

// ==================== TASK FILTERS ====================

function getTaskFilters(userRole: Role): FilterDefinition[] {
  const filters: FilterDefinition[] = []

  // Status filter
  filters.push({
    id: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { value: 'not-started', label: 'Not Started' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'in-review', label: 'In Review' },
      { value: 'completed', label: 'Completed' },
      { value: 'blocked', label: 'Blocked' },
    ],
  })

  // Priority filter
  filters.push({
    id: 'priority',
    label: 'Priority',
    type: 'multiselect',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
  })

  // Assigned To filter
  filters.push({
    id: 'assignedTo',
    label: 'Assigned To',
    type: 'multiselect',
    options: [], // Will be populated based on role
  })

  // Project filter
  filters.push({
    id: 'project',
    label: 'Project',
    type: 'multiselect',
    options: [], // Will be populated with projects
  })

  // Due Date Range
  filters.push({
    id: 'dueDate',
    label: 'Due Date',
    type: 'daterange',
  })

  // Search
  filters.push({
    id: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search tasks...',
  })

  return filters
}

// ==================== CALL FILTERS ====================

function getCallFilters(userRole: Role): FilterDefinition[] {
  const filters: FilterDefinition[] = []

  // Status filter
  filters.push({
    id: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'rescheduled', label: 'Rescheduled' },
    ],
  })

  // Outcome filter
  filters.push({
    id: 'outcome',
    label: 'Outcome',
    type: 'multiselect',
    options: [
      { value: 'connected', label: 'Connected' },
      { value: 'voicemail', label: 'Voicemail' },
      { value: 'no-answer', label: 'No Answer' },
      { value: 'busy', label: 'Busy' },
      { value: 'callback-requested', label: 'Callback Requested' },
      { value: 'not-interested', label: 'Not Interested' },
      { value: 'interested', label: 'Interested' },
      { value: 'meeting-scheduled', label: 'Meeting Scheduled' },
    ],
  })

  // Assigned To filter
  filters.push({
    id: 'assignedTo',
    label: 'Assigned To',
    type: 'multiselect',
    options: [], // Will be populated based on role
  })

  // Date Range
  filters.push({
    id: 'date',
    label: 'Call Date',
    type: 'daterange',
  })

  // Company filter
  filters.push({
    id: 'company',
    label: 'Company',
    type: 'text',
    placeholder: 'Filter by company...',
  })

  // Search
  filters.push({
    id: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search calls...',
  })

  return filters
}

// ==================== ATTENDANCE FILTERS ====================

function getAttendanceFilters(userRole: Role, userDepartment?: string): FilterDefinition[] {
  const filters: FilterDefinition[] = []

  // Date Range (required)
  filters.push({
    id: 'dateRange',
    label: 'Date Range',
    type: 'daterange',
    required: true,
    defaultValue: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(),
    },
  })

  // Status filter
  filters.push({
    id: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { value: 'present', label: 'Present' },
      { value: 'absent', label: 'Absent' },
      { value: 'late', label: 'Late' },
      { value: 'half-day', label: 'Half Day' },
      { value: 'leave', label: 'Leave' },
    ],
  })

  // User filter (for managers and admins)
  if (canViewTeamData(userRole)) {
    filters.push({
      id: 'user',
      label: 'User',
      type: 'multiselect',
      options: [], // Will be populated with team members
    })
  }

  // Department filter (for managers and admins)
  if (canViewAll(userRole)) {
    filters.push({
      id: 'department',
      label: 'Department',
      type: 'multiselect',
      options: [
        { value: 'sales', label: 'Sales' },
        { value: 'hr', label: 'HR' },
        { value: 'recruitment', label: 'Recruitment' },
        { value: 'finance', label: 'Finance' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'analytics', label: 'Analytics' },
        { value: 'rnd', label: 'R&D' },
        { value: 'development', label: 'Development' },
      ],
    })
  }

  // Search
  filters.push({
    id: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search by user name...',
  })

  return filters
}

// ==================== USER FILTERS ====================

function getUserFilters(userRole: Role): FilterDefinition[] {
  const filters: FilterDefinition[] = []

  // Role filter
  filters.push({
    id: 'role',
    label: 'Role',
    type: 'multiselect',
    options: [
      { value: 'executive', label: 'Executive' },
      { value: 'manager', label: 'Manager' },
      { value: 'superadmin', label: 'SuperAdmin' },
    ],
  })

  // Status filter
  filters.push({
    id: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  })

  // Department filter
  filters.push({
    id: 'department',
    label: 'Department',
    type: 'multiselect',
    options: [
      { value: 'sales', label: 'Sales' },
      { value: 'hr', label: 'HR' },
      { value: 'recruitment', label: 'Recruitment' },
      { value: 'finance', label: 'Finance' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'analytics', label: 'Analytics' },
      { value: 'rnd', label: 'R&D' },
      { value: 'development', label: 'Development' },
    ],
  })

  // Date Created Range
  filters.push({
    id: 'dateCreated',
    label: 'Date Created',
    type: 'daterange',
  })

  // Search
  filters.push({
    id: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search users...',
  })

  return filters
}

// ==================== RECRUITMENT FILTERS ====================

function getJobListingsFilters(): FilterDefinition[] {
  return [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'active', label: 'Active' },
        { value: 'closed', label: 'Closed' },
        { value: 'archived', label: 'Archived' },
      ],
    },
    {
      id: 'department',
      label: 'Department',
      type: 'multiselect',
      options: [
        { value: 'sales', label: 'Sales' },
        { value: 'hr', label: 'HR' },
        { value: 'recruitment', label: 'Recruitment' },
        { value: 'finance', label: 'Finance' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'analytics', label: 'Analytics' },
        { value: 'rnd', label: 'R&D' },
        { value: 'development', label: 'Development' },
      ],
    },
    {
      id: 'datePosted',
      label: 'Date Posted',
      type: 'daterange',
    },
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search job listings...',
    },
  ]
}

function getCandidatesFilters(userRole: Role): FilterDefinition[] {
  return [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'new', label: 'New' },
        { value: 'screening', label: 'Screening' },
        { value: 'interview', label: 'Interview' },
        { value: 'offer', label: 'Offer' },
        { value: 'hired', label: 'Hired' },
        { value: 'rejected', label: 'Rejected' },
      ],
    },
    {
      id: 'jobRole',
      label: 'Job Role',
      type: 'multiselect',
      options: [], // Will be populated with job roles
    },
    {
      id: 'department',
      label: 'Department',
      type: 'multiselect',
      options: [
        { value: 'sales', label: 'Sales' },
        { value: 'hr', label: 'HR' },
        { value: 'recruitment', label: 'Recruitment' },
        { value: 'finance', label: 'Finance' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'analytics', label: 'Analytics' },
        { value: 'rnd', label: 'R&D' },
        { value: 'development', label: 'Development' },
      ],
    },
    {
      id: 'dateApplied',
      label: 'Date Applied',
      type: 'daterange',
    },
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search candidates...',
    },
  ]
}

function getApplicationsFilters(): FilterDefinition[] {
  return [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'applied', label: 'Applied' },
        { value: 'screening', label: 'Screening' },
        { value: 'interview', label: 'Interview' },
        { value: 'offer', label: 'Offer' },
        { value: 'hired', label: 'Hired' },
        { value: 'rejected', label: 'Rejected' },
      ],
    },
    {
      id: 'jobRole',
      label: 'Job Role',
      type: 'multiselect',
      options: [], // Will be populated
    },
    {
      id: 'dateApplied',
      label: 'Date Applied',
      type: 'daterange',
    },
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search applications...',
    },
  ]
}

// ==================== SALES FILTERS ====================

function getLeadsFilters(userRole: Role): FilterDefinition[] {
  return [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'new', label: 'New' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'unqualified', label: 'Unqualified' },
        { value: 'converted', label: 'Converted' },
      ],
    },
    {
      id: 'source',
      label: 'Source',
      type: 'multiselect',
      options: [], // Will be populated
    },
    {
      id: 'assignedTo',
      label: 'Assigned To',
      type: 'multiselect',
      options: [], // Will be populated based on role
    },
    {
      id: 'dateCreated',
      label: 'Date Created',
      type: 'daterange',
    },
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search leads...',
    },
  ]
}

function getDealsFilters(userRole: Role): FilterDefinition[] {
  return [
    {
      id: 'stage',
      label: 'Stage',
      type: 'multiselect',
      options: [
        { value: 'prospecting', label: 'Prospecting' },
        { value: 'qualification', label: 'Qualification' },
        { value: 'proposal', label: 'Proposal' },
        { value: 'negotiation', label: 'Negotiation' },
        { value: 'closed-won', label: 'Closed Won' },
        { value: 'closed-lost', label: 'Closed Lost' },
      ],
    },
    {
      id: 'valueRange',
      label: 'Value Range',
      type: 'number',
    },
    {
      id: 'assignedTo',
      label: 'Assigned To',
      type: 'multiselect',
      options: [], // Will be populated
    },
    {
      id: 'expectedCloseDate',
      label: 'Expected Close Date',
      type: 'daterange',
    },
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search deals...',
    },
  ]
}

function getQuotationsFilters(userRole: Role): FilterDefinition[] {
  return [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'expired', label: 'Expired' },
      ],
    },
    {
      id: 'date',
      label: 'Date',
      type: 'daterange',
    },
    {
      id: 'assignedTo',
      label: 'Assigned To',
      type: 'multiselect',
      options: [], // Will be populated
    },
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search quotations...',
    },
  ]
}

// ==================== FINANCE FILTERS ====================

function getInvoicesFilters(): FilterDefinition[] {
  return [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      id: 'invoiceDate',
      label: 'Invoice Date',
      type: 'daterange',
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      type: 'daterange',
    },
    {
      id: 'customer',
      label: 'Customer',
      type: 'text',
      placeholder: 'Filter by customer...',
    },
    {
      id: 'amountRange',
      label: 'Amount Range',
      type: 'number',
    },
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search invoices...',
    },
  ]
}

function getExpensesFilters(userRole: Role): FilterDefinition[] {
  return [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'paid', label: 'Paid' },
      ],
    },
    {
      id: 'category',
      label: 'Category',
      type: 'multiselect',
      options: [], // Will be populated
    },
    {
      id: 'submittedBy',
      label: 'Submitted By',
      type: 'multiselect',
      options: [], // Will be populated based on role
    },
    {
      id: 'date',
      label: 'Date',
      type: 'daterange',
    },
    {
      id: 'amountRange',
      label: 'Amount Range',
      type: 'number',
    },
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search expenses...',
    },
  ]
}

function getTransactionsFilters(): FilterDefinition[] {
  return [
    {
      id: 'type',
      label: 'Type',
      type: 'multiselect',
      options: [
        { value: 'income', label: 'Income' },
        { value: 'expense', label: 'Expense' },
        { value: 'transfer', label: 'Transfer' },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      type: 'multiselect',
      options: [], // Will be populated
    },
    {
      id: 'date',
      label: 'Date',
      type: 'daterange',
    },
    {
      id: 'amountRange',
      label: 'Amount Range',
      type: 'number',
    },
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search transactions...',
    },
  ]
}

// ==================== MARKETING FILTERS ====================

function getCampaignsFilters(): FilterDefinition[] {
  return [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'active', label: 'Active' },
        { value: 'paused', label: 'Paused' },
        { value: 'completed', label: 'Completed' },
      ],
    },
    {
      id: 'type',
      label: 'Type',
      type: 'multiselect',
      options: [
        { value: 'email', label: 'Email' },
        { value: 'social', label: 'Social' },
        { value: 'paid-ads', label: 'Paid Ads' },
      ],
    },
    {
      id: 'date',
      label: 'Date',
      type: 'daterange',
    },
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search campaigns...',
    },
  ]
}

function getEmailTemplatesFilters(): FilterDefinition[] {
  return [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    {
      id: 'category',
      label: 'Category',
      type: 'multiselect',
      options: [], // Will be populated
    },
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search templates...',
    },
  ]
}

// ==================== HR FILTERS ====================

function getEmployeesFilters(userRole: Role): FilterDefinition[] {
  return [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'on-leave', label: 'On Leave' },
      ],
    },
    {
      id: 'department',
      label: 'Department',
      type: 'multiselect',
      options: [
        { value: 'sales', label: 'Sales' },
        { value: 'hr', label: 'HR' },
        { value: 'recruitment', label: 'Recruitment' },
        { value: 'finance', label: 'Finance' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'analytics', label: 'Analytics' },
        { value: 'rnd', label: 'R&D' },
        { value: 'development', label: 'Development' },
      ],
    },
    {
      id: 'role',
      label: 'Role',
      type: 'multiselect',
      options: [
        { value: 'executive', label: 'Executive' },
        { value: 'manager', label: 'Manager' },
      ],
    },
    {
      id: 'dateJoined',
      label: 'Date Joined',
      type: 'daterange',
    },
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search employees...',
    },
  ]
}

function getOnboardingFilters(): FilterDefinition[] {
  return [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      id: 'department',
      label: 'Department',
      type: 'multiselect',
      options: [
        { value: 'sales', label: 'Sales' },
        { value: 'hr', label: 'HR' },
        { value: 'recruitment', label: 'Recruitment' },
        { value: 'finance', label: 'Finance' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'analytics', label: 'Analytics' },
        { value: 'rnd', label: 'R&D' },
        { value: 'development', label: 'Development' },
      ],
    },
    {
      id: 'dateStarted',
      label: 'Date Started',
      type: 'daterange',
    },
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search onboarding...',
    },
  ]
}


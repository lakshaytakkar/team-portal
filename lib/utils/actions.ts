/**
 * Action utility functions for contextual action resolution
 * Returns appropriate actions based on role, department, and page context
 */

import {
  canCreateProject,
  canEditProject,
  canDeleteProject,
  canCreateTask,
  canEditTask,
  canDeleteTask,
  canUpdateTaskStatus,
  canChangeTaskPriority,
  canReassignTask,
  canEditCall,
  canDeleteCall,
  canApproveCorrection,
  canEditAttendance,
  canCreateUser,
  canEditUser,
  canDeleteUser,
  canAssignRoles,
  canViewAllUsers,
  canViewAllCalls,
  canViewTeamAttendance,
  canApproveLeaveRequests,
  type Role,
} from './permissions'

export type ActionType =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'duplicate'
  | 'archive'
  | 'assign'
  | 'reassign'
  | 'update-status'
  | 'change-priority'
  | 'add-subtask'
  | 'schedule-followup'
  | 'reschedule'
  | 'mark-complete'
  | 'log-outcome'
  | 'request-correction'
  | 'approve-correction'
  | 'check-in-out'
  | 'send'
  | 'print'
  | 'convert'
  | 'activate'
  | 'deactivate'
  | 'complete'
  | 'cancel'
  | 'reset-password'
  | 'view-activity'
  | 'view-analytics'
  | 'export'
  | 'import'
  | 'bulk-update'

export interface Action {
  id: string
  type: ActionType
  label: string
  icon?: string
  variant?: 'default' | 'destructive' | 'outline' | 'ghost'
  requiresConfirmation?: boolean
  confirmationMessage?: string
  onClick: () => void | Promise<void>
}

export interface RowActionContext {
  entityType: string
  entity: any
  userRole: Role
  userDepartment?: string
  currentUserId: string
  isOwnEntity?: boolean
  isTeamEntity?: boolean
}

export interface TopbarActionContext {
  page: string
  userRole: Role
  userDepartment?: string
  currentUserId: string
  hasSelectedItems?: boolean
  itemCount?: number
}

/**
 * Get row-level actions for an entity
 */
export function getRowActions(context: RowActionContext): Action[] {
  const { entityType, entity, userRole, currentUserId } = context

  switch (entityType) {
    case 'project':
      return getProjectRowActions(context)
    case 'task':
      return getTaskRowActions(context)
    case 'call':
      return getCallRowActions(context)
    case 'attendance':
      return getAttendanceRowActions(context)
    case 'leave-request':
      return getLeaveRequestRowActions(context)
    case 'user':
      return getUserRowActions(context)
    case 'training':
      return getTrainingRowActions(context)
    case 'meeting-note':
      return getMeetingNoteRowActions(context)
    case 'personal-document':
      return getPersonalDocumentRowActions(context)
    default:
      return []
  }
}

function getProjectRowActions(context: RowActionContext): Action[] {
  const { entity, userRole, currentUserId } = context
  const actions: Action[] = []

  // View Detail (always available via card click, but can be explicit action)
  actions.push({
    id: 'view',
    type: 'view',
    label: 'View Details',
    onClick: () => {
      // Navigate to detail page
      window.location.href = `/projects/${entity.id}`
    },
  })

  // Edit
  if (canEditProject(userRole, entity.owner?.id || entity.ownerId, currentUserId)) {
    actions.push({
      id: 'edit',
      type: 'edit',
      label: 'Edit',
      onClick: () => {
        // Open edit drawer/modal
        // This will be handled by the component
      },
    })
  }

  // Delete
  if (canDeleteProject(userRole)) {
    actions.push({
      id: 'delete',
      type: 'delete',
      label: 'Delete',
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to delete "${entity.name}"? This action cannot be undone.`,
      onClick: () => {
        // Handle delete
      },
    })
  }

  // Duplicate
  if (canCreateProject(userRole)) {
    actions.push({
      id: 'duplicate',
      type: 'duplicate',
      label: 'Duplicate',
      onClick: () => {
        // Handle duplicate
      },
    })
  }

  // Archive (if not already archived)
  if (canEditProject(userRole, entity.owner?.id || entity.ownerId, currentUserId)) {
    if (entity.status !== 'cancelled') {
      actions.push({
        id: 'archive',
        type: 'archive',
        label: 'Archive',
        onClick: () => {
          // Handle archive
        },
      })
    }
  }

  return actions
}

function getTaskRowActions(context: RowActionContext): Action[] {
  const { entity, userRole, currentUserId } = context
  const actions: Action[] = []

  // View Detail
  actions.push({
    id: 'view',
    type: 'view',
    label: 'View Details',
    onClick: () => {
      window.location.href = `/tasks/${entity.id}`
    },
  })

  // Edit
  if (canEditTask(userRole, entity.resource?.id || entity.assignedTo, currentUserId)) {
    actions.push({
      id: 'edit',
      type: 'edit',
      label: 'Edit',
      onClick: () => {
        // Open edit drawer
      },
    })
  }

  // Delete
  if (canDeleteTask(userRole)) {
    actions.push({
      id: 'delete',
      type: 'delete',
      label: 'Delete',
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to delete "${entity.name}"?`,
      onClick: () => {
        // Handle delete
      },
    })
  }

  // Update Status (quick action, but also in menu)
  if (canUpdateTaskStatus(userRole, entity.resource?.id || entity.assignedTo, currentUserId)) {
    actions.push({
      id: 'update-status',
      type: 'update-status',
      label: 'Update Status',
      onClick: () => {
        // Show status update dropdown
      },
    })
  }

  // Change Priority
  if (canChangeTaskPriority(userRole)) {
    actions.push({
      id: 'change-priority',
      type: 'change-priority',
      label: 'Change Priority',
      onClick: () => {
        // Show priority selector
      },
    })
  }

  // Reassign
  if (canReassignTask(userRole)) {
    actions.push({
      id: 'reassign',
      type: 'reassign',
      label: 'Reassign',
      onClick: () => {
        // Show assignee selector
      },
    })
  }

  // Add Subtask (for level 0 and 1 tasks)
  if (canCreateTask(userRole) && entity.level !== undefined && entity.level < 2) {
    actions.push({
      id: 'add-subtask',
      type: 'add-subtask',
      label: 'Add Subtask',
      onClick: () => {
        // Open create subtask drawer
      },
    })
  }

  // Duplicate
  if (canCreateTask(userRole)) {
    actions.push({
      id: 'duplicate',
      type: 'duplicate',
      label: 'Duplicate',
      onClick: () => {
        // Handle duplicate
      },
    })
  }

  return actions
}

function getCallRowActions(context: RowActionContext): Action[] {
  const { entity, userRole, currentUserId } = context
  const actions: Action[] = []

  // View Detail
  actions.push({
    id: 'view',
    type: 'view',
    label: 'View Details',
    onClick: () => {
      window.location.href = `/my-calls/${entity.id}`
    },
  })

  // Edit
  if (canEditCall(userRole, entity.assignedTo?.id || entity.assignedToId, currentUserId)) {
    actions.push({
      id: 'edit',
      type: 'edit',
      label: 'Edit',
      onClick: () => {
        // Open edit drawer
      },
    })
  }

  // Delete
  if (canDeleteCall(userRole, entity.assignedTo?.id || entity.assignedToId, currentUserId)) {
    actions.push({
      id: 'delete',
      type: 'delete',
      label: 'Delete',
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to delete this call?',
      onClick: () => {
        // Handle delete
      },
    })
  }

  // Log Outcome
  actions.push({
    id: 'log-outcome',
    type: 'log-outcome',
    label: 'Log Outcome',
    onClick: () => {
      // Open outcome dialog
    },
  })

  // Schedule Follow-up
  actions.push({
    id: 'schedule-followup',
    type: 'schedule-followup',
    label: 'Schedule Follow-up',
    onClick: () => {
      // Open schedule dialog
    },
  })

  // Reschedule
  if (entity.status === 'scheduled') {
    actions.push({
      id: 'reschedule',
      type: 'reschedule',
      label: 'Reschedule',
      onClick: () => {
        // Open reschedule dialog
      },
    })
  }

  // Mark Complete
  if (entity.status === 'scheduled') {
    actions.push({
      id: 'mark-complete',
      type: 'mark-complete',
      label: 'Mark Complete',
      onClick: () => {
        // Mark as completed
      },
    })
  }

  return actions
}

function getAttendanceRowActions(context: RowActionContext): Action[] {
  const { entity, userRole, currentUserId } = context
  const actions: Action[] = []

  // View Detail
  actions.push({
    id: 'view',
    type: 'view',
    label: 'View Details',
    onClick: () => {
      // Show attendance detail
    },
  })

  // Request Correction (for own attendance)
  if (entity.userId === currentUserId || entity.user?.id === currentUserId) {
    actions.push({
      id: 'request-correction',
      type: 'request-correction',
      label: 'Request Correction',
      onClick: () => {
        // Open correction request dialog
      },
    })
  }

  // Approve Correction (for managers/admins)
  if (canApproveCorrection(userRole) && entity.correctionRequest) {
    actions.push({
      id: 'approve-correction',
      type: 'approve-correction',
      label: 'Approve Correction',
      onClick: () => {
        // Approve correction
      },
    })
  }

  // Edit (superadmin only)
  if (canEditAttendance(userRole)) {
    actions.push({
      id: 'edit',
      type: 'edit',
      label: 'Edit',
      onClick: () => {
        // Open edit dialog
      },
    })
  }

  return actions
}

function getLeaveRequestRowActions(context: RowActionContext): Action[] {
  const { entity, userRole, currentUserId, userDepartment } = context
  const actions: Action[] = []

  // View Details
  actions.push({
    id: 'view',
    type: 'view',
    label: 'View Details',
    onClick: () => {
      // Show leave request detail - handled by component
    },
  })

  // Edit (creator only, pending only)
  if (entity.userId === currentUserId && entity.status === 'pending') {
    actions.push({
      id: 'edit',
      type: 'edit',
      label: 'Edit',
      onClick: () => {
        // Open edit dialog - handled by component
      },
    })
  }

  // Cancel (creator only, pending only)
  if (entity.userId === currentUserId && entity.status === 'pending') {
    actions.push({
      id: 'cancel',
      type: 'cancel',
      label: 'Cancel',
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to cancel this leave request?',
      onClick: () => {
        // Cancel leave request - handled by component
      },
    })
  }

  // Approve (manager/HR/superadmin, pending only)
  if (canApproveLeaveRequests(userRole, userDepartment) && entity.status === 'pending') {
    actions.push({
      id: 'approve',
      type: 'update-status',
      label: 'Approve',
      onClick: () => {
        // Open approval dialog - handled by component
      },
    })
  }

  // Reject (manager/HR/superadmin, pending only)
  if (canApproveLeaveRequests(userRole, userDepartment) && entity.status === 'pending') {
    actions.push({
      id: 'reject',
      type: 'update-status',
      label: 'Reject',
      variant: 'destructive',
      onClick: () => {
        // Open rejection dialog - handled by component
      },
    })
  }

  return actions
}

function getUserRowActions(context: RowActionContext): Action[] {
  const { entity, userRole, currentUserId } = context
  const actions: Action[] = []

  // View Detail
  actions.push({
    id: 'view',
    type: 'view',
    label: 'View Profile',
    onClick: () => {
      window.location.href = `/admin/users/${entity.id}`
    },
  })

  // Edit
  if (canEditUser(userRole, entity.id, currentUserId)) {
    actions.push({
      id: 'edit',
      type: 'edit',
      label: 'Edit',
      onClick: () => {
        // Open edit drawer
      },
    })
  }

  // Delete
  if (canDeleteUser(userRole)) {
    actions.push({
      id: 'delete',
      type: 'delete',
      label: 'Delete',
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to delete user "${entity.name || entity.email}"?`,
      onClick: () => {
        // Handle delete
      },
    })
  }

  // Activate/Deactivate
  if (canEditUser(userRole, entity.id, currentUserId)) {
    actions.push({
      id: entity.isActive ? 'deactivate' : 'activate',
      type: entity.isActive ? 'deactivate' : 'activate',
      label: entity.isActive ? 'Deactivate' : 'Activate',
      onClick: () => {
        // Toggle active status
      },
    })
  }

  // Assign Role
  if (canAssignRoles(userRole)) {
    actions.push({
      id: 'assign-role',
      type: 'assign',
      label: 'Assign Role',
      onClick: () => {
        // Open role assignment dialog
      },
    })
  }

  // Reset Password
  if (canEditUser(userRole, entity.id, currentUserId)) {
    actions.push({
      id: 'reset-password',
      type: 'reset-password',
      label: 'Reset Password',
      onClick: () => {
        // Open reset password dialog
      },
    })
  }

  // View Activity
  if (canViewAllUsers(userRole)) {
    actions.push({
      id: 'view-activity',
      type: 'view-activity',
      label: 'View Activity',
      onClick: () => {
        // Show activity log
      },
    })
  }

  return actions
}

/**
 * Get topbar actions (primary and secondary) for a page
 */
export function getTopbarActions(context: TopbarActionContext): {
  primary: Action[]
  secondary: Action[]
} {
  const { page, userRole } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  // Page-specific action resolution
  if (page.includes('/projects')) {
    return getProjectsTopbarActions(context)
  } else if (page.includes('/tasks')) {
    return getTasksTopbarActions(context)
  } else if (page.includes('/my-calls') || page.includes('/calls')) {
    return getCallsTopbarActions(context)
  } else if (page.includes('/my-attendance') || page.includes('/attendance')) {
    return getAttendanceTopbarActions(context)
  } else if (page.includes('/my-leave-requests')) {
    return getLeaveRequestsTopbarActions(context)
  } else if (page.includes('/admin/users')) {
    return getUsersTopbarActions(context)
  } else if (page.includes('/recruitment/job-listings')) {
    return getJobListingsTopbarActions(context)
  } else if (page.includes('/recruitment/candidates')) {
    return getCandidatesTopbarActions(context)
  } else if (page.includes('/sales/leads')) {
    return getLeadsTopbarActions(context)
  } else if (page.includes('/sales/deals')) {
    return getDealsTopbarActions(context)
  } else if (page.includes('/finance/invoices')) {
    return getInvoicesTopbarActions(context)
  } else if (page.includes('/finance/expenses')) {
    return getExpensesTopbarActions(context)
  } else if (page.includes('/marketing/campaigns')) {
    return getCampaignsTopbarActions(context)
  } else if (page.includes('/hr/employees')) {
    return getEmployeesTopbarActions(context)
  } else if (page.includes('/my-training') || page.includes('/admin/training')) {
    return getTrainingTopbarActions(context)
  } else if (page.includes('/my-meeting-notes') || page.includes('/admin/meeting-notes')) {
    return getMeetingNotesTopbarActions(context)
  } else if (page.includes('/my-documents') || page.includes('/admin/documents')) {
    return getDocumentsTopbarActions(context)
  }

  return { primary, secondary }
}

function getProjectsTopbarActions(context: TopbarActionContext) {
  const { userRole, hasSelectedItems } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  // Primary: Create Project
  if (canCreateProject(userRole)) {
    primary.push({
      id: 'create-project',
      type: 'create',
      label: 'New Project',
      onClick: () => {
        // Open create drawer
      },
    })
  }

  // Secondary: Export
  secondary.push({
    id: 'export',
    type: 'export',
    label: 'Export to CSV',
    onClick: () => {
      // Trigger export
    },
  })

  // Secondary: View Toggle
  secondary.push({
    id: 'view-toggle',
    type: 'view',
    label: 'Toggle View',
    onClick: () => {
      // Toggle list/kanban view
    },
  })

  // Secondary: Bulk Actions (when items selected)
  if (hasSelectedItems && canCreateProject(userRole)) {
    secondary.push({
      id: 'bulk-actions',
      type: 'bulk-update',
      label: 'Bulk Actions',
      onClick: () => {
        // Show bulk actions menu
      },
    })
  }

  return { primary, secondary }
}

function getTasksTopbarActions(context: TopbarActionContext) {
  const { userRole, hasSelectedItems } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  // Primary: Create Task
  if (canCreateTask(userRole)) {
    primary.push({
      id: 'create-task',
      type: 'create',
      label: 'New Task',
      onClick: () => {
        // Open create drawer
      },
    })
  }

  // Secondary: Export
  secondary.push({
    id: 'export',
    type: 'export',
    label: 'Export to CSV',
    onClick: () => {
      // Trigger export
    },
  })

  // Secondary: Bulk Status Update
  if (hasSelectedItems && canCreateTask(userRole)) {
    secondary.push({
      id: 'bulk-status',
      type: 'bulk-update',
      label: 'Bulk Update Status',
      onClick: () => {
        // Show status update dialog
      },
    })
  }

  // Secondary: Bulk Assign
  if (hasSelectedItems && canCreateTask(userRole)) {
    secondary.push({
      id: 'bulk-assign',
      type: 'bulk-update',
      label: 'Bulk Assign',
      onClick: () => {
        // Show assign dialog
      },
    })
  }

  return { primary, secondary }
}

function getCallsTopbarActions(context: TopbarActionContext) {
  const { userRole, hasSelectedItems } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  // Primary: Schedule Call
  primary.push({
    id: 'schedule-call',
    type: 'create',
    label: 'Schedule Call',
    onClick: () => {
      // Open schedule drawer
    },
  })

  // Secondary: Export
  secondary.push({
    id: 'export',
    type: 'export',
    label: 'Export to CSV',
    onClick: () => {
      // Trigger export
    },
  })

  // Secondary: Bulk Log Outcome
  if (hasSelectedItems) {
    secondary.push({
      id: 'bulk-log-outcome',
      type: 'bulk-update',
      label: 'Bulk Log Outcome',
      onClick: () => {
        // Show outcome dialog
      },
    })
  }

  // Secondary: Import
  if (canViewAllCalls(userRole)) {
    secondary.push({
      id: 'import',
      type: 'import',
      label: 'Import Calls',
      onClick: () => {
        // Open import dialog
      },
    })
  }

  return { primary, secondary }
}

function getAttendanceTopbarActions(context: TopbarActionContext) {
  const { userRole } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  // Primary: Check In/Out (contextual)
  primary.push({
    id: 'check-in-out',
    type: 'check-in-out',
    label: 'Check In', // Will be dynamic based on current status
    onClick: () => {
      // Open check in/out dialog
    },
  })

  // Secondary: Export
  secondary.push({
    id: 'export',
    type: 'export',
    label: 'Export to CSV',
    onClick: () => {
      // Trigger export
    },
  })

  // Secondary: Request Correction
  secondary.push({
    id: 'request-correction',
    type: 'request-correction',
    label: 'Request Correction',
    onClick: () => {
      // Open correction request dialog
    },
  })

  // Secondary: View Team Attendance
  if (canViewTeamAttendance(userRole)) {
    secondary.push({
      id: 'view-team',
      type: 'view',
      label: 'View Team Attendance',
      onClick: () => {
        // Navigate to team attendance view
      },
    })
  }

  return { primary, secondary }
}

function getLeaveRequestsTopbarActions(context: TopbarActionContext) {
  const { userRole } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  // Primary: Request Leave
  primary.push({
    id: 'request-leave',
    type: 'create',
    label: 'Request Leave',
    onClick: () => {
      // Open request leave dialog - handled by component
    },
  })

  // Secondary: Export
  secondary.push({
    id: 'export',
    type: 'export',
    label: 'Export to CSV',
    onClick: () => {
      // Trigger export - handled by component
    },
  })

  return { primary, secondary }
}

function getUsersTopbarActions(context: TopbarActionContext) {
  const { userRole, hasSelectedItems } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  // Primary: Add User
  if (canCreateUser(userRole)) {
    primary.push({
      id: 'create-user',
      type: 'create',
      label: 'Add User',
      onClick: () => {
        // Open create drawer
      },
    })
  }

  // Secondary: Export
  secondary.push({
    id: 'export',
    type: 'export',
    label: 'Export to CSV',
    onClick: () => {
      // Trigger export
    },
  })

  // Secondary: Bulk Actions
  if (hasSelectedItems && canCreateUser(userRole)) {
    secondary.push({
      id: 'bulk-actions',
      type: 'bulk-update',
      label: 'Bulk Actions',
      onClick: () => {
        // Show bulk actions menu
      },
    })
  }

  return { primary, secondary }
}

// Additional page-specific action functions
function getJobListingsTopbarActions(context: TopbarActionContext) {
  const { userRole, hasSelectedItems } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  primary.push({
    id: 'create-job-listing',
    type: 'create',
    label: 'Create Job Listing',
    onClick: () => {},
  })

  secondary.push({
    id: 'export',
    type: 'export',
    label: 'Export to CSV',
    onClick: () => {},
  })

  if (hasSelectedItems) {
    secondary.push({
      id: 'bulk-actions',
      type: 'bulk-update',
      label: 'Bulk Actions',
      onClick: () => {},
    })
  }

  return { primary, secondary }
}

function getCandidatesTopbarActions(context: TopbarActionContext) {
  const { userRole, hasSelectedItems } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  primary.push({
    id: 'add-candidate',
    type: 'create',
    label: 'Add Candidate',
    onClick: () => {},
  })

  secondary.push({
    id: 'export',
    type: 'export',
    label: 'Export to CSV',
    onClick: () => {},
  })

  if (hasSelectedItems) {
    secondary.push({
      id: 'bulk-actions',
      type: 'bulk-update',
      label: 'Bulk Actions',
      onClick: () => {},
    })
  }

  return { primary, secondary }
}

function getLeadsTopbarActions(context: TopbarActionContext) {
  const { hasSelectedItems } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  primary.push({
    id: 'add-lead',
    type: 'create',
    label: 'Add Lead',
    onClick: () => {},
  })

  secondary.push({
    id: 'export',
    type: 'export',
    label: 'Export to CSV',
    onClick: () => {},
  })

  secondary.push({
    id: 'import',
    type: 'import',
    label: 'Import Leads',
    onClick: () => {},
  })

  if (hasSelectedItems) {
    secondary.push({
      id: 'bulk-actions',
      type: 'bulk-update',
      label: 'Bulk Actions',
      onClick: () => {},
    })
  }

  return { primary, secondary }
}

function getDealsTopbarActions(context: TopbarActionContext) {
  const { hasSelectedItems } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  primary.push({
    id: 'create-deal',
    type: 'create',
    label: 'Create Deal',
    onClick: () => {},
  })

  secondary.push({
    id: 'export',
    type: 'export',
    label: 'Export to CSV',
    onClick: () => {},
  })

  if (hasSelectedItems) {
    secondary.push({
      id: 'bulk-actions',
      type: 'bulk-update',
      label: 'Bulk Actions',
      onClick: () => {},
    })
  }

  return { primary, secondary }
}

function getInvoicesTopbarActions(context: TopbarActionContext) {
  const { hasSelectedItems } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  primary.push({
    id: 'create-invoice',
    type: 'create',
    label: 'Create Invoice',
    onClick: () => {},
  })

  secondary.push({
    id: 'export',
    type: 'export',
    label: 'Export to CSV',
    onClick: () => {},
  })

  if (hasSelectedItems) {
    secondary.push({
      id: 'bulk-actions',
      type: 'bulk-update',
      label: 'Bulk Actions',
      onClick: () => {},
    })
  }

  return { primary, secondary }
}

function getExpensesTopbarActions(context: TopbarActionContext) {
  const { hasSelectedItems } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  primary.push({
    id: 'add-expense',
    type: 'create',
    label: 'Add Expense',
    onClick: () => {},
  })

  secondary.push({
    id: 'export',
    type: 'export',
    label: 'Export to CSV',
    onClick: () => {},
  })

  if (hasSelectedItems) {
    secondary.push({
      id: 'bulk-actions',
      type: 'bulk-update',
      label: 'Bulk Actions',
      onClick: () => {},
    })
  }

  return { primary, secondary }
}

function getCampaignsTopbarActions(context: TopbarActionContext) {
  const { hasSelectedItems } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  primary.push({
    id: 'create-campaign',
    type: 'create',
    label: 'Create Campaign',
    onClick: () => {},
  })

  secondary.push({
    id: 'export',
    type: 'export',
    label: 'Export to CSV',
    onClick: () => {},
  })

  if (hasSelectedItems) {
    secondary.push({
      id: 'bulk-actions',
      type: 'bulk-update',
      label: 'Bulk Actions',
      onClick: () => {},
    })
  }

  return { primary, secondary }
}

function getEmployeesTopbarActions(context: TopbarActionContext) {
  const { hasSelectedItems } = context
  const primary: Action[] = []
  const secondary: Action[] = []

  primary.push({
    id: 'add-employee',
    type: 'create',
    label: 'Add Employee',
    onClick: () => {},
  })

  secondary.push({
    id: 'export',
    type: 'export',
    label: 'Export to CSV',
    onClick: () => {},
  })

  if (hasSelectedItems) {
    secondary.push({
      id: 'bulk-actions',
      type: 'bulk-update',
      label: 'Bulk Actions',
      onClick: () => {},
    })
  }

  return { primary, secondary }
}

function getTrainingTopbarActions(context: TopbarActionContext) {
  const primary: Action[] = []
  const secondary: Action[] = []

  primary.push({
    id: 'enroll-training',
    type: 'create',
    label: 'Enroll in Training',
    onClick: () => {},
  })

  return { primary, secondary }
}

function getMeetingNotesTopbarActions(context: TopbarActionContext) {
  const primary: Action[] = []
  const secondary: Action[] = []

  primary.push({
    id: 'new-meeting-note',
    type: 'create',
    label: 'New Meeting Note',
    onClick: () => {},
  })

  return { primary, secondary }
}

function getDocumentsTopbarActions(context: TopbarActionContext) {
  const primary: Action[] = []
  const secondary: Action[] = []

  primary.push({
    id: 'upload-document',
    type: 'create',
    label: 'Upload Document',
    onClick: () => {},
  })

  return { primary, secondary }
}

function getTrainingRowActions(context: RowActionContext): Action[] {
  const { entity, userRole, currentUserId } = context
  const actions: Action[] = []

  // View Detail
  actions.push({
    id: 'view',
    type: 'view',
    label: 'View Details',
    onClick: () => {
      window.location.href = `/my-training/${entity.id}`
    },
  })

  // Edit (superadmin only)
  if (userRole === 'superadmin') {
    actions.push({
      id: 'edit',
      type: 'edit',
      label: 'Edit',
      onClick: () => {
        // Open edit dialog
      },
    })
  }

  // Delete (superadmin only)
  if (userRole === 'superadmin') {
    actions.push({
      id: 'delete',
      type: 'delete',
      label: 'Delete',
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to delete "${entity.title}"?`,
      onClick: () => {
        // Handle delete
      },
    })
  }

  return actions
}

function getMeetingNoteRowActions(context: RowActionContext): Action[] {
  const { entity, userRole, currentUserId } = context
  const actions: Action[] = []

  // View Detail
  actions.push({
    id: 'view',
    type: 'view',
    label: 'View Details',
    onClick: () => {
      window.location.href = `/my-meeting-notes/${entity.id}`
    },
  })

  // Edit (own notes or superadmin)
  if (entity.userId === currentUserId || userRole === 'superadmin') {
    actions.push({
      id: 'edit',
      type: 'edit',
      label: 'Edit',
      onClick: () => {
        // Open edit dialog
      },
    })
  }

  // Delete (own notes or superadmin)
  if (entity.userId === currentUserId || userRole === 'superadmin') {
    actions.push({
      id: 'delete',
      type: 'delete',
      label: 'Delete',
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to delete "${entity.title}"?`,
      onClick: () => {
        // Handle delete
      },
    })
  }

  return actions
}

function getPersonalDocumentRowActions(context: RowActionContext): Action[] {
  const { entity, userRole, currentUserId } = context
  const actions: Action[] = []

  // Download
  actions.push({
    id: 'download',
    type: 'view',
    label: 'Download',
    onClick: () => {
      // Download file
      window.open(entity.url, '_blank')
    },
  })

  // Edit (own documents or superadmin)
  if (entity.userId === currentUserId || userRole === 'superadmin') {
    actions.push({
      id: 'edit',
      type: 'edit',
      label: 'Edit',
      onClick: () => {
        // Open edit dialog
      },
    })
  }

  // Delete (own documents or superadmin)
  if (entity.userId === currentUserId || userRole === 'superadmin') {
    actions.push({
      id: 'delete',
      type: 'delete',
      label: 'Delete',
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to delete "${entity.name}"?`,
      onClick: () => {
        // Handle delete
      },
    })
  }

  return actions
}


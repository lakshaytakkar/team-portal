/**
 * Permission utility functions for role-based access control
 * Based on the permission matrix defined in docs/permissions.md
 */

export type Role = 'executive' | 'manager' | 'superadmin'

/**
 * Check if user is superadmin
 */
export function isSuperAdmin(role: string): boolean {
  return role === 'superadmin'
}

/**
 * Check if user is manager or superadmin
 */
export function isManager(role: string): boolean {
  return role === 'manager' || role === 'superadmin'
}

/**
 * Check if user can view all items (not just own/team)
 */
export function canViewAll(role: string): boolean {
  return role === 'superadmin'
}

/**
 * Check if user can view team data
 */
export function canViewTeamData(role: string): boolean {
  return isManager(role)
}

// ==================== PROJECT PERMISSIONS ====================

/**
 * Check if user can view all projects (permission-based)
 * @param userPermissions - User's permission object from getUserPermissions()
 * @param role - Fallback to role-based check if permissions not available
 */
export function canViewAllProjects(userPermissions?: Record<string, boolean>, role?: string): boolean {
  if (userPermissions) {
    // Check for explicit permission
    if (userPermissions['projects.view.all'] === true) return true
    if (userPermissions['projects.view.assigned'] === true) return false
  }
  // Fallback to role-based check
  if (role) return role === 'superadmin'
  return false
}

/**
 * Check if user can only view assigned projects (permission-based)
 * @param userPermissions - User's permission object from getUserPermissions()
 * @param role - Fallback to role-based check if permissions not available
 */
export function canViewAssignedProjectsOnly(userPermissions?: Record<string, boolean>, role?: string): boolean {
  if (userPermissions) {
    // Check for explicit permission
    if (userPermissions['projects.view.assigned'] === true && userPermissions['projects.view.all'] !== true) {
      return true
    }
  }
  // Fallback: executives see only assigned by default
  if (role) return role === 'executive'
  return false
}

export function canCreateProject(role: string): boolean {
  return isManager(role)
}

export function canEditProject(
  role: string,
  projectOwnerId: string,
  currentUserId: string
): boolean {
  if (role === 'superadmin') return true
  if (isManager(role)) return true // Manager can edit team projects (RLS will enforce)
  return projectOwnerId === currentUserId
}

export function canDeleteProject(role: string): boolean {
  return role === 'superadmin'
}

export function canAssignTeamMembers(role: string): boolean {
  return isManager(role)
}

// ==================== TASK PERMISSIONS ====================

/**
 * Check if user can view all tasks (permission-based)
 * @param userPermissions - User's permission object from getUserPermissions()
 * @param role - Fallback to role-based check if permissions not available
 */
export function canViewAllTasks(userPermissions?: Record<string, boolean>, role?: string): boolean {
  if (userPermissions) {
    // Check for explicit permission
    if (userPermissions['tasks.view.all'] === true) return true
    if (userPermissions['tasks.view.assigned'] === true) return false
  }
  // Fallback to role-based check
  if (role) return role === 'superadmin' || role === 'manager'
  return false
}

/**
 * Check if user can only view assigned tasks (permission-based)
 * @param userPermissions - User's permission object from getUserPermissions()
 * @param role - Fallback to role-based check if permissions not available
 */
export function canViewAssignedTasksOnly(userPermissions?: Record<string, boolean>, role?: string): boolean {
  if (userPermissions) {
    // Check for explicit permission
    if (userPermissions['tasks.view.assigned'] === true && userPermissions['tasks.view.all'] !== true) {
      return true
    }
  }
  // Fallback: executives see only assigned by default
  if (role) return role === 'executive'
  return false
}

export function canCreateTask(role: string): boolean {
  return isManager(role) || role === 'superadmin'
}

/**
 * Check if user can create tasks for themselves (executives can create for self)
 */
export function canCreateTaskForSelf(role: string): boolean {
  return true // All roles can create tasks for themselves
}

export function canEditTask(
  role: string,
  taskAssignedToId: string,
  currentUserId: string
): boolean {
  if (role === 'superadmin') return true
  if (isManager(role)) return true // Manager can edit team tasks
  return taskAssignedToId === currentUserId
}

export function canDeleteTask(role: string): boolean {
  return role === 'superadmin'
}

export function canAssignTask(role: string): boolean {
  return isManager(role)
}

export function canUpdateTaskStatus(
  role: string,
  taskAssignedToId: string,
  currentUserId: string
): boolean {
  if (role === 'superadmin') return true
  if (isManager(role)) return true // Manager can update team task status
  return taskAssignedToId === currentUserId
}

export function canChangeTaskPriority(role: string): boolean {
  return isManager(role)
}

export function canReassignTask(role: string): boolean {
  return isManager(role)
}

/**
 * Check if user can perform bulk operations on tasks (SuperAdmin only)
 */
export function canBulkOperateTasks(role: string): boolean {
  return role === 'superadmin'
}

/**
 * Check if user can export tasks (Manager + SuperAdmin)
 */
export function canExportTasks(role: string): boolean {
  return isManager(role)
}

// ==================== CALL PERMISSIONS ====================

export function canViewAllCalls(role: string): boolean {
  return role === 'superadmin'
}

export function canCreateCall(role: string): boolean {
  return true // All roles can create calls
}

export function canAssignCallToOthers(role: string): boolean {
  return isManager(role)
}

export function canEditCall(
  role: string,
  callAssignedToId: string,
  currentUserId: string
): boolean {
  if (role === 'superadmin') return true
  if (isManager(role)) return true // Manager can edit team calls
  return callAssignedToId === currentUserId
}

export function canDeleteCall(
  role: string,
  callAssignedToId: string,
  currentUserId: string
): boolean {
  if (role === 'superadmin') return true
  if (isManager(role)) return true // Manager can delete team calls
  return callAssignedToId === currentUserId
}

export function canLogCallOutcome(role: string): boolean {
  return true // All roles can log outcomes for their calls
}

// ==================== ATTENDANCE PERMISSIONS ====================

export function canViewAllAttendance(role: string): boolean {
  return role === 'superadmin'
}

export function canViewTeamAttendance(role: string): boolean {
  return isManager(role)
}

export function canCheckInOut(role: string): boolean {
  return true // All roles can check in/out for themselves
}

export function canRequestCorrection(role: string): boolean {
  return true // All roles can request corrections for their own attendance
}

export function canApproveCorrection(role: string): boolean {
  return isManager(role)
}

export function canEditAttendance(role: string): boolean {
  return role === 'superadmin'
}

// ==================== USER & ADMIN PERMISSIONS ====================

export function canViewAllUsers(role: string): boolean {
  return role === 'superadmin'
}

export function canViewTeamUsers(role: string): boolean {
  return isManager(role)
}

export function canEditUser(
  role: string,
  targetUserId: string,
  currentUserId: string
): boolean {
  if (role === 'superadmin') return true
  // Users can edit their own profile (limited fields)
  return targetUserId === currentUserId
}

export function canEditTeamUsers(role: string): boolean {
  return role === 'superadmin'
}

export function canAssignRoles(role: string): boolean {
  return role === 'superadmin'
}

export function canManagePermissions(role: string): boolean {
  return role === 'superadmin'
}

export function canCreateUser(role: string): boolean {
  return role === 'superadmin'
}

export function canDeleteUser(role: string): boolean {
  return role === 'superadmin'
}

// ==================== EXPORT PERMISSIONS ====================

export function canExportData(role: string, page: string): boolean {
  // SuperAdmin can export from all pages
  if (role === 'superadmin') return true
  
  // Manager can export from most pages
  if (isManager(role)) {
    // Managers can export from all standard pages
    return true
  }
  
  // Executive can export from personal pages only
  const personalPages = ['my-attendance', 'my-calls', 'tasks', 'projects']
  return personalPages.some(p => page.includes(p))
}

// ==================== DEPARTMENT-SPECIFIC PERMISSIONS ====================

export function canAccessDepartment(
  role: string,
  userDepartment: string,
  targetDepartment: string
): boolean {
  if (role === 'superadmin') return true
  if (role === 'manager') {
    // Managers can access their own department and potentially cross-department team members
    return true // RLS will enforce at data level
  }
  // Executives can only access their own department
  return userDepartment === targetDepartment
}

/**
 * Check if user can perform action based on department
 */
export function canPerformDepartmentAction(
  role: string,
  userDepartment: string,
  requiredDepartment?: string
): boolean {
  if (role === 'superadmin') return true
  if (!requiredDepartment) return true
  if (role === 'manager') return true // Managers can perform cross-department actions
  return userDepartment === requiredDepartment
}

// ==================== LEAVE REQUEST PERMISSIONS ====================

/**
 * Check if user can view all leave requests (not just own)
 */
export function canViewAllLeaveRequests(role: string, departmentCode?: string): boolean {
  if (role === 'superadmin') return true
  if (departmentCode?.toLowerCase() === 'hr') return true
  if (role === 'manager') return true
  return false
}

/**
 * Check if user can approve leave requests
 * Note: This is a basic check. Actual approval requires checking manager relationship in server action
 */
export function canApproveLeaveRequests(role: string, departmentCode?: string): boolean {
  if (role === 'superadmin') return true
  if (departmentCode?.toLowerCase() === 'hr') return true
  if (role === 'manager') return true
  return false
}

/**
 * Check if user can edit a leave request
 */
export function canEditLeaveRequest(
  userId: string,
  leaveRequestUserId: string,
  leaveRequestStatus: string
): boolean {
  // Only creator can edit
  if (userId !== leaveRequestUserId) return false
  // Only pending requests can be edited
  if (leaveRequestStatus !== 'pending') return false
  return true
}


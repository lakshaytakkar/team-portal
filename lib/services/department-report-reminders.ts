/**
 * Department Report Reminder Service
 * 
 * Handles scheduling reminders, sending notifications, and escalating
 * late submissions for department reports.
 */

import { createClient } from '@/lib/supabase/server'
import type { DepartmentReportReminderConfig } from '@/lib/types/department-reports'

/**
 * Get reminder configurations (department-specific or global defaults)
 */
export async function getReminderConfigs(
  departmentId?: string
): Promise<DepartmentReportReminderConfig[]> {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('department_report_reminder_configs')
      .select('*')
      .eq('is_active', true)
      .order('escalation_level', { ascending: true })

    if (departmentId) {
      // Get department-specific configs first, then global defaults
      query = query.or(`department_id.is.null,department_id.eq.${departmentId}`)
    } else {
      // Only global defaults
      query = query.is('department_id', null)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch reminder configs: ${error.message}`)
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      departmentId: row.department_id || undefined,
      reminderType: row.reminder_type,
      daysBefore: row.days_before || undefined,
      daysAfter: row.days_after || undefined,
      escalationLevel: row.escalation_level,
      notifyUsers: row.notify_users || [],
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    console.error('Error fetching reminder configs:', error)
    throw error
  }
}

/**
 * Get users to notify based on reminder config
 */
async function getUsersToNotify(
  config: DepartmentReportReminderConfig,
  departmentId: string,
  assignedUserId?: string
): Promise<string[]> {
  const supabase = await createClient()
  const userIds: string[] = []

  for (const notifyUser of config.notifyUsers) {
    if (typeof notifyUser === 'string') {
      // Handle role-based or special identifiers
      if (notifyUser === 'assigned_user' && assignedUserId) {
        userIds.push(assignedUserId)
      } else if (notifyUser === 'manager') {
        // Get department manager
        const { data: department } = await supabase
          .from('departments')
          .select('manager_id')
          .eq('id', departmentId)
          .single()
        
        if (department?.manager_id) {
          userIds.push(department.manager_id)
        }
      } else if (notifyUser === 'superadmin') {
        // Get all superadmins
        const { data: superadmins } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'superadmin')
          .eq('is_active', true)
        
        if (superadmins) {
          superadmins.forEach(admin => userIds.push(admin.id))
        }
      } else {
        // Assume it's a user ID
        userIds.push(notifyUser)
      }
    } else if (notifyUser.type === 'user') {
      userIds.push(notifyUser.value)
    } else if (notifyUser.type === 'role') {
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', notifyUser.value)
        .eq('is_active', true)
      
      if (users) {
        users.forEach(user => userIds.push(user.id))
      }
    }
  }

  // Remove duplicates
  return Array.from(new Set(userIds))
}

/**
 * Send reminder notification for a department report
 */
export async function sendReminderForDepartmentReport(
  reportId: string,
  reminderType: 'before_deadline' | 'on_deadline' | 'after_deadline',
  escalationLevel: number = 1
): Promise<void> {
  const supabase = await createClient()

  try {
    // Get report details
    const { data: report, error: reportError } = await supabase
      .from('department_reports')
      .select(`
        id,
        department_id,
        report_date,
        deadline,
        status,
        departments:department_id (
          id,
          name,
          manager_id
        ),
        department_report_assignments!inner (
          assigned_user_id
        )
      `)
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      throw new Error('Report not found')
    }

    const department = (report as any).departments
    const assignment = (report as any).department_report_assignments?.[0]
    const assignedUserId = assignment?.assigned_user_id

    // Get reminder config
    const configs = await getReminderConfigs(report.department_id)
    const config = configs.find(
      c => c.reminderType === reminderType && c.escalationLevel === escalationLevel
    )

    if (!config) {
      console.warn(`No reminder config found for type ${reminderType}, level ${escalationLevel}`)
      return
    }

    // Get users to notify
    const userIds = await getUsersToNotify(config, report.department_id, assignedUserId)

    if (userIds.length === 0) {
      console.warn('No users to notify for reminder')
      return
    }

    // Create notification message
    const reportDate = new Date(report.report_date).toLocaleDateString()
    const deadline = new Date(report.deadline).toLocaleString()
    
    let title = ''
    let message = ''
    let notificationType = ''

    switch (reminderType) {
      case 'before_deadline':
        title = `Department Report Due Soon - ${department?.name || 'Department'}`
        message = `The daily report for ${reportDate} is due on ${deadline}. Please submit your report before the deadline.`
        notificationType = 'department_report_due_soon'
        break
      case 'on_deadline':
        title = `Department Report Deadline Today - ${department?.name || 'Department'}`
        message = `The daily report for ${reportDate} is due today at ${deadline}. Please submit your report as soon as possible.`
        notificationType = 'department_report_deadline_today'
        break
      case 'after_deadline':
        const daysLate = Math.floor(
          (new Date().getTime() - new Date(report.deadline).getTime()) / (1000 * 60 * 60 * 24)
        )
        title = `Department Report Overdue - ${department?.name || 'Department'}`
        message = `The daily report for ${reportDate} is ${daysLate} day${daysLate !== 1 ? 's' : ''} overdue. Please submit immediately.`
        notificationType = escalationLevel > 1 ? 'department_report_reminder_escalation' : 'department_report_late'
        break
    }

    // Create notifications for all users
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: notificationType,
      title,
      message,
      data: {
        department_report_id: reportId,
        department_id: report.department_id,
        report_date: report.report_date,
        deadline: report.deadline,
        reminder_type: reminderType,
        escalation_level: escalationLevel,
      },
      read: false,
    }))

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications)

    if (notificationError) {
      throw new Error(`Failed to create notifications: ${notificationError.message}`)
    }

    // Update submission record with reminder count
    const { data: submission } = await supabase
      .from('department_report_submissions')
      .select('id, reminder_sent_count')
      .eq('department_report_id', reportId)
      .single()

    if (submission) {
      await supabase
        .from('department_report_submissions')
        .update({
          reminder_sent_count: (submission.reminder_sent_count || 0) + 1,
          last_reminder_sent_at: new Date().toISOString(),
        })
        .eq('id', submission.id)
    }
  } catch (error) {
    console.error('Error sending reminder:', error)
    throw error
  }
}

/**
 * Schedule reminders for upcoming deadlines
 */
export async function scheduleDepartmentReportReminders(
  daysAhead: number = 1
): Promise<number> {
  const supabase = await createClient()
  let remindersScheduled = 0

  try {
    // Get all active assignments
    const { data: assignments } = await supabase
      .from('department_report_assignments')
      .select('department_id, category_id, assigned_user_id, submission_deadline_time, timezone')
      .eq('is_active', true)

    if (!assignments || assignments.length === 0) {
      return 0
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check each day in the range
    for (let dayOffset = 0; dayOffset <= daysAhead; dayOffset++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() + dayOffset)
      const checkDateStr = checkDate.toISOString().split('T')[0]

      for (const assignment of assignments) {
        // Calculate deadline for this date
        const deadlineTime = assignment.submission_deadline_time
        const timezone = assignment.timezone || 'UTC'
        const deadline = new Date(`${checkDateStr}T${deadlineTime}`)

        // Get or create department report
        let query = supabase
          .from('department_reports')
          .select('id, status, deadline')
          .eq('department_id', assignment.department_id)
          .eq('report_date', checkDateStr)

        if (assignment.category_id) {
          query = query.eq('category_id', assignment.category_id)
        } else {
          query = query.is('category_id', null)
        }

        const { data: report } = await query.single()

        // Get reminder configs for this department
        const configs = await getReminderConfigs(assignment.department_id)

        // Check each config
        for (const config of configs) {
          let shouldSend = false

          if (config.reminderType === 'before_deadline' && config.daysBefore) {
            const reminderDate = new Date(deadline)
            reminderDate.setDate(reminderDate.getDate() - (config.daysBefore || 0))
            reminderDate.setHours(0, 0, 0, 0)
            
            const todayStart = new Date(today)
            todayStart.setHours(0, 0, 0, 0)
            
            if (reminderDate.getTime() === todayStart.getTime()) {
              shouldSend = true
            }
          } else if (config.reminderType === 'on_deadline') {
            const deadlineStart = new Date(deadline)
            deadlineStart.setHours(0, 0, 0, 0)
            
            const todayStart = new Date(today)
            todayStart.setHours(0, 0, 0, 0)
            
            if (deadlineStart.getTime() === todayStart.getTime()) {
              shouldSend = true
            }
          } else if (config.reminderType === 'after_deadline' && config.daysAfter) {
            const reminderDate = new Date(deadline)
            reminderDate.setDate(reminderDate.getDate() + (config.daysAfter || 0))
            reminderDate.setHours(0, 0, 0, 0)
            
            const todayStart = new Date(today)
            todayStart.setHours(0, 0, 0, 0)
            
            if (reminderDate.getTime() === todayStart.getTime()) {
              // Only send if report is not submitted or is late
              if (!report || report.status !== 'submitted' || new Date(report.deadline) < new Date()) {
                shouldSend = true
              }
            }
          }

          if (shouldSend && report) {
            try {
              await sendReminderForDepartmentReport(
                report.id,
                config.reminderType,
                config.escalationLevel
              )
              remindersScheduled++
            } catch (error) {
              console.error(`Error sending reminder for report ${report.id}:`, error)
            }
          }
        }
      }
    }

    return remindersScheduled
  } catch (error) {
    console.error('Error scheduling reminders:', error)
    throw error
  }
}

/**
 * Escalate late submission to managers and superadmins
 */
export async function escalateLateSubmission(
  departmentId: string,
  reportDate: string
): Promise<void> {
  const supabase = await createClient()

  try {
    // Get report
    const { data: report } = await supabase
      .from('department_reports')
      .select(`
        id,
        department_id,
        report_date,
        deadline,
        status,
        departments:department_id (
          id,
          name,
          manager_id
        )
      `)
      .eq('department_id', departmentId)
      .eq('report_date', reportDate)
      .single()

    if (!report) {
      throw new Error('Report not found')
    }

    const department = (report as any).departments
    const daysLate = Math.floor(
      (new Date().getTime() - new Date(report.deadline).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Get users to notify (manager and superadmins)
    const userIds: string[] = []

    if (department?.manager_id) {
      userIds.push(department.manager_id)
    }

    // Get all superadmins
    const { data: superadmins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'superadmin')
      .eq('is_active', true)

    if (superadmins) {
      superadmins.forEach(admin => {
        if (!userIds.includes(admin.id)) {
          userIds.push(admin.id)
        }
      })
    }

    if (userIds.length === 0) {
      console.warn('No users to notify for escalation')
      return
    }

    // Create escalation notifications
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: 'department_report_reminder_escalation',
      title: `Escalation: Overdue Department Report - ${department?.name || 'Department'}`,
      message: `The daily report for ${reportDate} is ${daysLate} day${daysLate !== 1 ? 's' : ''} overdue and requires immediate attention.`,
      data: {
        department_report_id: report.id,
        department_id: departmentId,
        report_date: reportDate,
        days_late: daysLate,
      },
      read: false,
    }))

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications)

    if (notificationError) {
      throw new Error(`Failed to create escalation notifications: ${notificationError.message}`)
    }
  } catch (error) {
    console.error('Error escalating late submission:', error)
    throw error
  }
}

/**
 * Get upcoming deadlines for reminder scheduling
 */
export async function getUpcomingDeadlines(
  daysAhead: number = 7
): Promise<Array<{
  departmentId: string
  departmentName: string
  reportDate: string
  deadline: string
  assignedUserId: string
  assignedUserName: string
}>> {
  const supabase = await createClient()

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + daysAhead)
    const endDateStr = endDate.toISOString().split('T')[0]

    // Get all active assignments
    const { data: assignments } = await supabase
      .from('department_report_assignments')
      .select(`
        department_id,
        category_id,
        assigned_user_id,
        submission_deadline_time,
        timezone,
        departments:department_id (
          id,
          name
        ),
        profiles:assigned_user_id (
          id,
          full_name
        )
      `)
      .eq('is_active', true)

    if (!assignments || assignments.length === 0) {
      return []
    }

    const deadlines: Array<{
      departmentId: string
      departmentName: string
      reportDate: string
      deadline: string
      assignedUserId: string
      assignedUserName: string
    }> = []

    // Generate deadlines for each day in range
    for (let dayOffset = 0; dayOffset <= daysAhead; dayOffset++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() + dayOffset)
      const checkDateStr = checkDate.toISOString().split('T')[0]

      for (const assignment of assignments) {
        const department = (assignment as any).departments
        const assignedUser = (assignment as any).profiles
        const deadlineTime = assignment.submission_deadline_time
        const deadline = `${checkDateStr}T${deadlineTime}`

        deadlines.push({
          departmentId: assignment.department_id,
          departmentName: department?.name || 'Unknown',
          reportDate: checkDateStr,
          deadline,
          assignedUserId: assignment.assigned_user_id,
          assignedUserName: assignedUser?.full_name || 'Unknown',
        })
      }
    }

    return deadlines.sort((a, b) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    )
  } catch (error) {
    console.error('Error fetching upcoming deadlines:', error)
    throw error
  }
}





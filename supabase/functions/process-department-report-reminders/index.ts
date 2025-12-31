import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Edge Function: Process Department Report Reminders
 * 
 * Purpose: Process reminders for department reports based on deadlines
 * 
 * Runs on cron schedule (every hour) to:
 * 1. Check for reports due in next 24 hours
 * 2. Send reminders based on configuration
 * 3. Escalate late submissions
 * 4. Create notifications in the notifications table
 */

interface ReminderConfig {
  id: string;
  department_id: string | null;
  reminder_type: 'before_deadline' | 'on_deadline' | 'after_deadline';
  days_before: number | null;
  days_after: number | null;
  escalation_level: number;
  notify_users: string[];
  is_active: boolean;
}

Deno.serve(async (req: Request) => {
  try {
    // Get Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Get all active assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from("department_report_assignments")
      .select(`
        id,
        department_id,
        category_id,
        assigned_user_id,
        submission_deadline_time,
        timezone,
        departments:department_id (
          id,
          name,
          manager_id
        ),
        profiles:assigned_user_id (
          id,
          full_name,
          email
        )
      `)
      .eq("is_active", true);

    if (assignmentsError) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch assignments", 
          details: assignmentsError 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!assignments || assignments.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          reminders_sent: 0,
          escalations_sent: 0,
          message: "No active assignments found",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get all active reminder configs
    const { data: configs, error: configsError } = await supabase
      .from("department_report_reminder_configs")
      .select("*")
      .eq("is_active", true)
      .order("escalation_level", { ascending: true });

    if (configsError) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch reminder configs", 
          details: configsError 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    let remindersSent = 0;
    let escalationsSent = 0;
    const notifications: Array<{
      user_id: string;
      type: string;
      title: string;
      message: string;
      data: Record<string, any>;
    }> = [];

    // Process each assignment
    for (const assignment of assignments) {
      const department = (assignment as any).departments;
      const assignedUser = (assignment as any).profiles;
      
      if (!department) continue;

      // Check last 7 days and next 3 days for reports
      for (let dayOffset = -7; dayOffset <= 3; dayOffset++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + dayOffset);
        const checkDateStr = checkDate.toISOString().split('T')[0];

        // Calculate deadline for this date
        const deadlineTime = assignment.submission_deadline_time;
        const timezone = assignment.timezone || 'UTC';
        const deadline = new Date(`${checkDateStr}T${deadlineTime}`);

        // Get or check if report exists
        let query = supabase
          .from("department_reports")
          .select("id, status, submitted_at, deadline, is_late")
          .eq("department_id", assignment.department_id)
          .eq("report_date", checkDateStr);

        if (assignment.category_id) {
          query = query.eq("category_id", assignment.category_id);
        } else {
          query = query.is("category_id", null);
        }

        const { data: report } = await query.single();

        // Process each reminder config
        for (const config of (configs || []) as ReminderConfig[]) {
          // Skip if config is department-specific and doesn't match
          if (config.department_id && config.department_id !== assignment.department_id) {
            continue;
          }

          let shouldSend = false;
          let reminderType: 'before_deadline' | 'on_deadline' | 'after_deadline' = config.reminder_type;

          if (config.reminder_type === 'before_deadline' && config.days_before) {
            const reminderDate = new Date(deadline);
            reminderDate.setDate(reminderDate.getDate() - config.days_before);
            reminderDate.setHours(0, 0, 0, 0);

            if (reminderDate.getTime() === today.getTime()) {
              shouldSend = true;
            }
          } else if (config.reminder_type === 'on_deadline') {
            const deadlineStart = new Date(deadline);
            deadlineStart.setHours(0, 0, 0, 0);

            if (deadlineStart.getTime() === today.getTime()) {
              shouldSend = true;
            }
          } else if (config.reminder_type === 'after_deadline' && config.days_after) {
            const reminderDate = new Date(deadline);
            reminderDate.setDate(reminderDate.getDate() + config.days_after);
            reminderDate.setHours(0, 0, 0, 0);

            if (reminderDate.getTime() === today.getTime()) {
              // Only send if report is not submitted or is late
              if (!report || report.status !== 'submitted' || report.is_late) {
                shouldSend = true;
              }
            }
          }

          if (shouldSend && report) {
            // Check if reminder was already sent today (to avoid duplicates)
            const { data: existingNotification } = await supabase
              .from("notifications")
              .select("id")
              .eq("data->>department_report_id", report.id)
              .eq("type", getNotificationType(reminderType, config.escalation_level))
              .gte("created_at", todayStr)
              .limit(1);

            if (existingNotification && existingNotification.length > 0) {
              continue; // Already sent today
            }

            // Get users to notify
            const userIds = await getUsersToNotify(
              supabase,
              config,
              assignment.department_id,
              assignment.assigned_user_id,
              department.manager_id
            );

            if (userIds.length === 0) {
              continue;
            }

            // Create notification message
            const reportDate = new Date(checkDateStr).toLocaleDateString();
            const deadlineStr = deadline.toLocaleString();
            const { title, message, type } = getReminderMessage(
              reminderType,
              department.name,
              reportDate,
              deadlineStr,
              config.escalation_level,
              report.is_late ? Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)) : 0
            );

            // Create notifications
            for (const userId of userIds) {
              notifications.push({
                user_id: userId,
                type,
                title,
                message,
                data: {
                  department_report_id: report.id,
                  department_id: assignment.department_id,
                  report_date: checkDateStr,
                  deadline: deadline.toISOString(),
                  reminder_type: reminderType,
                  escalation_level: config.escalation_level,
                },
              });
            }

            // Update submission record
            const { data: submission } = await supabase
              .from("department_report_submissions")
              .select("id, reminder_sent_count")
              .eq("department_report_id", report.id)
              .single();

            if (submission) {
              await supabase
                .from("department_report_submissions")
                .update({
                  reminder_sent_count: (submission.reminder_sent_count || 0) + 1,
                  last_reminder_sent_at: now.toISOString(),
                })
                .eq("id", submission.id);
            }

            remindersSent++;
          }
        }

        // Escalate if report is late and not submitted
        if (report && report.is_late && report.status !== 'submitted') {
          const daysLate = Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));
          
          // Only escalate if more than 1 day late and escalation level 2+
          if (daysLate > 1) {
            const escalationConfig = (configs || []).find(
              (c: ReminderConfig) => 
                c.reminder_type === 'after_deadline' && 
                c.escalation_level >= 2 &&
                (!c.department_id || c.department_id === assignment.department_id)
            );

            if (escalationConfig) {
              // Check if escalation was already sent today
              const { data: existingEscalation } = await supabase
                .from("notifications")
                .select("id")
                .eq("data->>department_report_id", report.id)
                .eq("type", "department_report_reminder_escalation")
                .gte("created_at", todayStr)
                .limit(1);

              if (!existingEscalation || existingEscalation.length === 0) {
                const escalationUserIds: string[] = [];
                
                if (department.manager_id) {
                  escalationUserIds.push(department.manager_id);
                }

                // Get all superadmins
                const { data: superadmins } = await supabase
                  .from("profiles")
                  .select("id")
                  .eq("role", "superadmin")
                  .eq("is_active", true);

                if (superadmins) {
                  superadmins.forEach((admin: any) => {
                    if (!escalationUserIds.includes(admin.id)) {
                      escalationUserIds.push(admin.id);
                    }
                  });
                }

                for (const userId of escalationUserIds) {
                  notifications.push({
                    user_id: userId,
                    type: "department_report_reminder_escalation",
                    title: `Escalation: Overdue Department Report - ${department.name}`,
                    message: `The daily report for ${reportDate} is ${daysLate} day${daysLate !== 1 ? 's' : ''} overdue and requires immediate attention.`,
                    data: {
                      department_report_id: report.id,
                      department_id: assignment.department_id,
                      report_date: checkDateStr,
                      days_late: daysLate,
                    },
                  });
                }

                escalationsSent++;
              }
            }
          }
        }
      }
    }

    // Insert all notifications in batch
    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notificationError) {
        return new Response(
          JSON.stringify({
            error: "Failed to create notifications",
            details: notificationError,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: remindersSent,
        escalations_sent: escalationsSent,
        notifications_created: notifications.length,
        processed_at: now.toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing department report reminders:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * Get users to notify based on reminder config
 */
async function getUsersToNotify(
  supabase: any,
  config: ReminderConfig,
  departmentId: string,
  assignedUserId: string,
  managerId: string | null
): Promise<string[]> {
  const userIds: string[] = [];

  for (const notifyUser of config.notify_users) {
    if (typeof notifyUser === 'string') {
      if (notifyUser === 'assigned_user' && assignedUserId) {
        userIds.push(assignedUserId);
      } else if (notifyUser === 'manager' && managerId) {
        userIds.push(managerId);
      } else if (notifyUser === 'superadmin') {
        const { data: superadmins } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "superadmin")
          .eq("is_active", true);

        if (superadmins) {
          superadmins.forEach((admin: any) => {
            if (!userIds.includes(admin.id)) {
              userIds.push(admin.id);
            }
          });
        }
      } else {
        // Assume it's a user ID
        userIds.push(notifyUser);
      }
    }
  }

  return Array.from(new Set(userIds));
}

/**
 * Get notification type based on reminder type and escalation level
 */
function getNotificationType(
  reminderType: 'before_deadline' | 'on_deadline' | 'after_deadline',
  escalationLevel: number
): string {
  switch (reminderType) {
    case 'before_deadline':
      return 'department_report_due_soon';
    case 'on_deadline':
      return 'department_report_deadline_today';
    case 'after_deadline':
      return escalationLevel > 1 
        ? 'department_report_reminder_escalation' 
        : 'department_report_late';
    default:
      return 'department_report_due_soon';
  }
}

/**
 * Get reminder message based on type
 */
function getReminderMessage(
  reminderType: 'before_deadline' | 'on_deadline' | 'after_deadline',
  departmentName: string,
  reportDate: string,
  deadlineStr: string,
  escalationLevel: number,
  daysLate: number
): { title: string; message: string; type: string } {
  switch (reminderType) {
    case 'before_deadline':
      return {
        title: `Department Report Due Soon - ${departmentName}`,
        message: `The daily report for ${reportDate} is due on ${deadlineStr}. Please submit your report before the deadline.`,
        type: 'department_report_due_soon',
      };
    case 'on_deadline':
      return {
        title: `Department Report Deadline Today - ${departmentName}`,
        message: `The daily report for ${reportDate} is due today at ${deadlineStr}. Please submit your report as soon as possible.`,
        type: 'department_report_deadline_today',
      };
    case 'after_deadline':
      return {
        title: escalationLevel > 1 
          ? `Escalation: Overdue Department Report - ${departmentName}`
          : `Department Report Overdue - ${departmentName}`,
        message: `The daily report for ${reportDate} is ${daysLate} day${daysLate !== 1 ? 's' : ''} overdue. Please submit immediately.`,
        type: escalationLevel > 1 
          ? 'department_report_reminder_escalation'
          : 'department_report_late',
      };
  }
}


import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Edge Function: Send Task Notifications
 * 
 * Purpose: Send notifications for task events
 * 
 * Events:
 * - Task assigned → Notify assignee
 * - Task due date approaching (1 day, 3 days) → Notify assignee
 * - Task overdue → Notify assignee and manager
 * - Task completed → Notify creator/manager
 * - Task blocked → Notify manager
 */

interface NotificationRequest {
  event_type: "assigned" | "due_soon" | "overdue" | "completed" | "blocked" | "comment_added" | "attachment_added";
  task_id: string;
  user_id?: string; // For specific user notifications
}

Deno.serve(async (req: Request) => {
  try {
    const { event_type, task_id, user_id }: NotificationRequest = await req.json();

    if (!event_type || !task_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select(`
        *,
        assigned_to_profile:profiles!tasks_assigned_to_id_fkey(id, full_name, email),
        created_by_profile:profiles!tasks_created_by_fkey(id, full_name, email)
      `)
      .eq("id", task_id)
      .is("deleted_at", null)
      .single();

    if (taskError || !task) {
      return new Response(
        JSON.stringify({ error: "Task not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const notifications: Array<{
      user_id: string;
      type: string;
      title: string;
      message: string;
      data: Record<string, any>;
    }> = [];

    switch (event_type) {
      case "assigned": {
        if (task.assigned_to_id) {
          notifications.push({
            user_id: task.assigned_to_id,
            type: "task_assigned",
            title: "New Task Assigned",
            message: `You have been assigned to task: ${task.name}`,
            data: { task_id: task.id, task_name: task.name },
          });
        }
        break;
      }

      case "due_soon": {
        if (task.assigned_to_id) {
          const daysUntilDue = task.due_date
            ? Math.ceil(
                (new Date(task.due_date).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : null;

          notifications.push({
            user_id: task.assigned_to_id,
            type: "task_due_soon",
            title: "Task Due Soon",
            message: `Task "${task.name}" is due ${daysUntilDue === 1 ? "tomorrow" : `in ${daysUntilDue} days`}`,
            data: {
              task_id: task.id,
              task_name: task.name,
              due_date: task.due_date,
              days_until_due: daysUntilDue,
            },
          });
        }
        break;
      }

      case "overdue": {
        if (task.assigned_to_id) {
          notifications.push({
            user_id: task.assigned_to_id,
            type: "task_overdue",
            title: "Task Overdue",
            message: `Task "${task.name}" is overdue`,
            data: {
              task_id: task.id,
              task_name: task.name,
              due_date: task.due_date,
            },
          });

          // Also notify manager if assigned_to has a manager
          if (task.assigned_to_profile) {
            const { data: employee } = await supabase
              .from("profiles")
              .select("manager_id")
              .eq("id", task.assigned_to_id)
              .single();

            if (employee?.manager_id) {
              notifications.push({
                user_id: employee.manager_id,
                type: "task_overdue",
                title: "Team Member Task Overdue",
                message: `Task "${task.name}" assigned to ${task.assigned_to_profile.full_name} is overdue`,
                data: {
                  task_id: task.id,
                  task_name: task.name,
                  assigned_to_id: task.assigned_to_id,
                  assigned_to_name: task.assigned_to_profile.full_name,
                  due_date: task.due_date,
                },
              });
            }
          }
        }
        break;
      }

      case "completed": {
        // Notify creator if different from assignee
        if (task.created_by && task.created_by !== task.assigned_to_id) {
          notifications.push({
            user_id: task.created_by,
            type: "task_completed",
            title: "Task Completed",
            message: `Task "${task.name}" has been completed`,
            data: {
              task_id: task.id,
              task_name: task.name,
              completed_by: task.assigned_to_id,
            },
          });
        }

        // Notify manager if assignee has a manager
        if (task.assigned_to_id) {
          const { data: employee } = await supabase
            .from("profiles")
            .select("manager_id")
            .eq("id", task.assigned_to_id)
            .single();

          if (employee?.manager_id && employee.manager_id !== task.created_by) {
            notifications.push({
              user_id: employee.manager_id,
              type: "task_completed",
              title: "Team Member Task Completed",
              message: `Task "${task.name}" has been completed by ${task.assigned_to_profile?.full_name || "team member"}`,
              data: {
                task_id: task.id,
                task_name: task.name,
                completed_by: task.assigned_to_id,
              },
            });
          }
        }
        break;
      }

      case "blocked": {
        // Notify manager
        if (task.assigned_to_id) {
          const { data: employee } = await supabase
            .from("profiles")
            .select("manager_id")
            .eq("id", task.assigned_to_id)
            .single();

          if (employee?.manager_id) {
            notifications.push({
              user_id: employee.manager_id,
              type: "task_blocked",
              title: "Task Blocked",
              message: `Task "${task.name}" assigned to ${task.assigned_to_profile?.full_name || "team member"} is blocked`,
              data: {
                task_id: task.id,
                task_name: task.name,
                assigned_to_id: task.assigned_to_id,
              },
            });
          }
        }
        break;
      }

      case "comment_added": {
        if (task.assigned_to_id && user_id && task.assigned_to_id !== user_id) {
          notifications.push({
            user_id: task.assigned_to_id,
            type: "task_comment_added",
            title: "New Comment on Task",
            message: `A new comment was added to task "${task.name}"`,
            data: {
              task_id: task.id,
              task_name: task.name,
              comment_by: user_id,
            },
          });
        }
        break;
      }

      case "attachment_added": {
        if (task.assigned_to_id && user_id && task.assigned_to_id !== user_id) {
          notifications.push({
            user_id: task.assigned_to_id,
            type: "task_attachment_added",
            title: "New Attachment on Task",
            message: `A new attachment was added to task "${task.name}"`,
            data: {
              task_id: task.id,
              task_name: task.name,
              attachment_by: user_id,
            },
          });
        }
        break;
      }
    }

    // Create notifications
    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) {
        return new Response(
          JSON.stringify({ error: "Failed to create notifications", details: insertError }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_created: notifications.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});


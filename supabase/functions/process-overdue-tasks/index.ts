import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Edge Function: Process Overdue Tasks
 * 
 * Purpose: Daily cron job to process overdue tasks
 * 
 * Schedule: Daily at 9 AM
 * 
 * Actions:
 * - Find all overdue tasks (due_date < today AND status != "completed")
 * - Send notifications to assignees
 * - Escalate to managers if overdue > 3 days
 * - Update task priority if overdue > 7 days
 */

Deno.serve(async (req: Request) => {
  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // Find all overdue tasks
    const { data: overdueTasks, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        *,
        assigned_to_profile:profiles!tasks_assigned_to_id_fkey(id, full_name, email, manager_id)
      `)
      .lt("due_date", todayStr)
      .neq("status", "completed")
      .is("deleted_at", null);

    if (tasksError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch overdue tasks", details: tasksError }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!overdueTasks || overdueTasks.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No overdue tasks found", processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const notifications: Array<{
      user_id: string;
      type: string;
      title: string;
      message: string;
      data: Record<string, any>;
    }> = [];

    const tasksToUpdate: Array<{ id: string; priority: string }> = [];

    for (const task of overdueTasks) {
      if (!task.due_date || !task.assigned_to_id) continue;

      const dueDate = new Date(task.due_date);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      // Send notification to assignee
      notifications.push({
        user_id: task.assigned_to_id,
        type: "task_overdue",
        title: "Task Overdue",
        message: `Task "${task.name}" is ${daysOverdue} day${daysOverdue !== 1 ? "s" : ""} overdue`,
        data: {
          task_id: task.id,
          task_name: task.name,
          due_date: task.due_date,
          days_overdue: daysOverdue,
        },
      });

      // Escalate to manager if overdue > 3 days
      if (daysOverdue > 3 && task.assigned_to_profile?.manager_id) {
        notifications.push({
          user_id: task.assigned_to_profile.manager_id,
          type: "task_overdue",
          title: "Team Member Task Overdue",
          message: `Task "${task.name}" assigned to ${task.assigned_to_profile.full_name} is ${daysOverdue} days overdue`,
          data: {
            task_id: task.id,
            task_name: task.name,
            assigned_to_id: task.assigned_to_id,
            assigned_to_name: task.assigned_to_profile.full_name,
            due_date: task.due_date,
            days_overdue: daysOverdue,
          },
        });
      }

      // Update priority if overdue > 7 days
      if (daysOverdue > 7 && task.priority !== "urgent") {
        tasksToUpdate.push({
          id: task.id,
          priority: "urgent",
        });
      }
    }

    // Create notifications
    if (notifications.length > 0) {
      const { error: notifyError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifyError) {
        return new Response(
          JSON.stringify({ error: "Failed to create notifications", details: notifyError }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Update task priorities
    if (tasksToUpdate.length > 0) {
      for (const taskUpdate of tasksToUpdate) {
        const { error: updateError } = await supabase
          .from("tasks")
          .update({
            priority: taskUpdate.priority,
            updated_at: new Date().toISOString(),
          })
          .eq("id", taskUpdate.id);

        if (updateError) {
          console.error(`Failed to update task ${taskUpdate.id}:`, updateError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        overdue_tasks_found: overdueTasks.length,
        notifications_created: notifications.length,
        priorities_updated: tasksToUpdate.length,
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


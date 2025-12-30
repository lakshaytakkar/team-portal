import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Edge Function: Calculate Task Analytics
 * 
 * Purpose: Calculate task analytics and metrics
 * 
 * Metrics:
 * - Completion rates by team/user
 * - Average time to completion
 * - Overdue task trends
 * - Priority distribution
 * - Status distribution over time
 * 
 * Schedule: Hourly or on-demand
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

    // Get all tasks
    const { data: allTasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, status, priority, assigned_to_id, due_date, created_at, updated_at")
      .is("deleted_at", null);

    if (tasksError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch tasks", details: tasksError }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!allTasks || allTasks.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          total: 0,
          by_status: {},
          by_priority: {},
          completion_rate: 0,
          overdue_count: 0,
          team_performance: [],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calculate status distribution
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let completedCount = 0;
    let overdueCount = 0;

    // Team performance tracking
    const teamPerformance = new Map<string, { total: number; completed: number }>();

    for (const task of allTasks) {
      // Status distribution
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;
      if (task.status === "completed") {
        completedCount++;
      }

      // Priority distribution
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;

      // Overdue count
      if (task.due_date && task.status !== "completed") {
        const dueDate = new Date(task.due_date);
        if (dueDate < today) {
          overdueCount++;
        }
      }

      // Team performance
      if (task.assigned_to_id) {
        if (!teamPerformance.has(task.assigned_to_id)) {
          teamPerformance.set(task.assigned_to_id, { total: 0, completed: 0 });
        }
        const perf = teamPerformance.get(task.assigned_to_id)!;
        perf.total++;
        if (task.status === "completed") {
          perf.completed++;
        }
      }
    }

    // Get user names for team performance
    const userIds = Array.from(teamPerformance.keys());
    const teamPerformanceArray = [];

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);

      for (const [userId, perf] of teamPerformance.entries()) {
        const profile = profilesMap.get(userId);
        teamPerformanceArray.push({
          user_id: userId,
          user_name: profile?.full_name || "Unknown",
          total_tasks: perf.total,
          completed_tasks: perf.completed,
          completion_rate: perf.total > 0 ? (perf.completed / perf.total) * 100 : 0,
        });
      }

      // Sort by completion rate descending
      teamPerformanceArray.sort((a, b) => b.completion_rate - a.completion_rate);
    }

    // Calculate average time to completion (for completed tasks)
    let avgCompletionTime = 0;
    const completedTasks = allTasks.filter((t) => t.status === "completed" && t.created_at && t.updated_at);
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, task) => {
        const created = new Date(task.created_at).getTime();
        const updated = new Date(task.updated_at).getTime();
        return sum + (updated - created);
      }, 0);
      avgCompletionTime = totalTime / completedTasks.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: allTasks.length,
        by_status: byStatus,
        by_priority: byPriority,
        completion_rate: allTasks.length > 0 ? (completedCount / allTasks.length) * 100 : 0,
        overdue_count: overdueCount,
        average_completion_time_days: Math.round(avgCompletionTime * 100) / 100,
        team_performance: teamPerformanceArray,
        calculated_at: new Date().toISOString(),
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


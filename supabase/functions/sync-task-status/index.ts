import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Edge Function: Sync Task Status
 * 
 * Purpose: Automatically sync parent task status based on child task statuses
 * 
 * Trigger: Called via database trigger when task status changes
 * 
 * Logic:
 * - When a subtask status changes, recalculate parent task status
 * - Rules:
 *   - If all subtasks completed → parent = "completed"
 *   - If any subtask "blocked" → parent = "blocked"
 *   - If any subtask "in-progress" → parent = "in-progress"
 *   - If all subtasks "not-started" → parent = "not-started"
 *   - Mixed states → parent = "in-progress"
 */

interface TaskStatusUpdate {
  task_id: string;
  old_status: string;
  new_status: string;
}

Deno.serve(async (req: Request) => {
  try {
    const { task_id, old_status, new_status }: TaskStatusUpdate = await req.json();

    if (!task_id || !new_status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the task to check if it has a parent
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("parent_id, level")
      .eq("id", task_id)
      .is("deleted_at", null)
      .single();

    if (taskError || !task) {
      return new Response(
        JSON.stringify({ error: "Task not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // If task has no parent, nothing to sync
    if (!task.parent_id) {
      return new Response(
        JSON.stringify({ success: true, message: "No parent to sync" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get all siblings (tasks with same parent)
    const { data: siblings, error: siblingsError } = await supabase
      .from("tasks")
      .select("id, status")
      .eq("parent_id", task.parent_id)
      .is("deleted_at", null);

    if (siblingsError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch siblings" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!siblings || siblings.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No siblings found" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calculate parent status based on sibling statuses
    const statuses = siblings.map((s: any) => s.status);
    const statusCounts = {
      completed: statuses.filter((s: string) => s === "completed").length,
      blocked: statuses.filter((s: string) => s === "blocked").length,
      "in-progress": statuses.filter((s: string) => s === "in-progress").length,
      "in-review": statuses.filter((s: string) => s === "in-review").length,
      "not-started": statuses.filter((s: string) => s === "not-started").length,
    };

    let parentStatus: string;

    // Rule 1: If all subtasks completed → parent = "completed"
    if (statusCounts.completed === siblings.length) {
      parentStatus = "completed";
    }
    // Rule 2: If any subtask "blocked" → parent = "blocked"
    else if (statusCounts.blocked > 0) {
      parentStatus = "blocked";
    }
    // Rule 3: If any subtask "in-progress" → parent = "in-progress"
    else if (statusCounts["in-progress"] > 0) {
      parentStatus = "in-progress";
    }
    // Rule 4: If all subtasks "not-started" → parent = "not-started"
    else if (statusCounts["not-started"] === siblings.length) {
      parentStatus = "not-started";
    }
    // Rule 5: Mixed states → parent = "in-progress"
    else {
      parentStatus = "in-progress";
    }

    // Get current parent status
    const { data: parentTask, error: parentError } = await supabase
      .from("tasks")
      .select("status")
      .eq("id", task.parent_id)
      .is("deleted_at", null)
      .single();

    if (parentError || !parentTask) {
      return new Response(
        JSON.stringify({ error: "Parent task not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Only update if status changed
    if (parentTask.status !== parentStatus) {
      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          status: parentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", task.parent_id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to update parent status" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Recursively sync grandparent if exists
      const { data: grandparent } = await supabase
        .from("tasks")
        .select("parent_id")
        .eq("id", task.parent_id)
        .is("deleted_at", null)
        .single();

      if (grandparent?.parent_id) {
        // Recursively call this function for the parent
        // Note: In production, you might want to use a queue or trigger
        // For now, we'll let the database trigger handle it
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        parent_id: task.parent_id,
        old_status: parentTask.status,
        new_status: parentStatus,
        updated: parentTask.status !== parentStatus,
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


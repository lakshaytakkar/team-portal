import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Edge Function: Bulk Task Operations
 * 
 * Purpose: Handle heavy bulk operations that might timeout in server actions
 * 
 * Operations:
 * - Bulk status update (100+ tasks)
 * - Bulk assignment (100+ tasks)
 * - Bulk priority change
 * - Bulk delete (with cascade handling)
 * 
 * Authentication: Requires SuperAdmin role (checked via service role key)
 */

interface BulkOperationRequest {
  operation: "update_status" | "assign" | "change_priority" | "delete";
  task_ids: string[];
  status?: string;
  assigned_to_id?: string;
  priority?: string;
  user_id: string; // User performing the operation
}

Deno.serve(async (req: Request) => {
  try {
    const body: BulkOperationRequest = await req.json();

    if (!body.operation || !body.task_ids || body.task_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is SuperAdmin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", body.user_id)
      .single();

    if (profileError || !profile || profile.role !== "superadmin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized: SuperAdmin role required" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const updateData: Record<string, any> = {
      updated_by: body.user_id,
      updated_at: new Date().toISOString(),
    };

    let result;

    switch (body.operation) {
      case "update_status": {
        if (!body.status) {
          return new Response(
            JSON.stringify({ error: "Status is required for update_status operation" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        updateData.status = body.status;
        const { data, error } = await supabase
          .from("tasks")
          .update(updateData)
          .in("id", body.task_ids)
          .is("deleted_at", null)
          .select("id");

        if (error) {
          return new Response(
            JSON.stringify({ error: "Failed to update status", details: error }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        result = { updated: data?.length || 0 };
        break;
      }

      case "assign": {
        if (!body.assigned_to_id) {
          return new Response(
            JSON.stringify({ error: "assigned_to_id is required for assign operation" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        updateData.assigned_to_id = body.assigned_to_id;
        const { data, error } = await supabase
          .from("tasks")
          .update(updateData)
          .in("id", body.task_ids)
          .is("deleted_at", null)
          .select("id");

        if (error) {
          return new Response(
            JSON.stringify({ error: "Failed to assign tasks", details: error }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        result = { assigned: data?.length || 0 };
        break;
      }

      case "change_priority": {
        if (!body.priority) {
          return new Response(
            JSON.stringify({ error: "Priority is required for change_priority operation" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        updateData.priority = body.priority;
        const { data, error } = await supabase
          .from("tasks")
          .update(updateData)
          .in("id", body.task_ids)
          .is("deleted_at", null)
          .select("id");

        if (error) {
          return new Response(
            JSON.stringify({ error: "Failed to change priority", details: error }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        result = { updated: data?.length || 0 };
        break;
      }

      case "delete": {
        // Soft delete
        const { data, error } = await supabase
          .from("tasks")
          .update({
            deleted_at: new Date().toISOString(),
            updated_by: body.user_id,
            updated_at: new Date().toISOString(),
          })
          .in("id", body.task_ids)
          .is("deleted_at", null)
          .select("id");

        if (error) {
          return new Response(
            JSON.stringify({ error: "Failed to delete tasks", details: error }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        result = { deleted: data?.length || 0 };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid operation" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({
        success: true,
        operation: body.operation,
        task_ids_count: body.task_ids.length,
        ...result,
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


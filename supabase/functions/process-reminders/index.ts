import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Edge Function: Process Reminders
 * 
 * Purpose: Process due reminders and create notifications
 * 
 * Runs on cron schedule (every 15 minutes) to:
 * 1. Find reminders where reminder_date <= NOW() AND status = 'scheduled'
 * 2. Create notification for each due reminder
 * 3. Update reminder status to 'triggered'
 * 4. If recurring, calculate next occurrence and create new reminder record
 */

interface RecurrencePattern {
  type: "daily" | "weekly" | "monthly" | "yearly";
  interval?: number;
  days_of_week?: number[]; // 1=Monday, 7=Sunday
  day_of_month?: number;
  end_date?: string; // YYYY-MM-DD
}

/**
 * Calculate next occurrence date based on recurrence pattern
 */
function calculateNextOccurrence(
  currentDate: Date,
  pattern: RecurrencePattern
): Date | null {
  const next = new Date(currentDate);

  switch (pattern.type) {
    case "daily": {
      const interval = pattern.interval || 1;
      next.setDate(next.getDate() + interval);
      break;
    }

    case "weekly": {
      const interval = pattern.interval || 1;
      if (pattern.days_of_week && pattern.days_of_week.length > 0) {
        // Find next matching day of week
        const currentDay = next.getDay(); // 0=Sunday, 1=Monday, etc.
        const normalizedCurrentDay = currentDay === 0 ? 7 : currentDay; // Convert to 1=Monday, 7=Sunday

        // Find next matching day
        const sortedDays = [...pattern.days_of_week].sort((a, b) => a - b);
        let nextDay = sortedDays.find((day) => day > normalizedCurrentDay);

        if (!nextDay) {
          // Next occurrence is in the next week
          nextDay = sortedDays[0];
          next.setDate(next.getDate() + (7 - normalizedCurrentDay + nextDay) + (interval - 1) * 7);
        } else {
          next.setDate(next.getDate() + (nextDay - normalizedCurrentDay));
        }
      } else {
        next.setDate(next.getDate() + (7 * interval));
      }
      break;
    }

    case "monthly": {
      const interval = pattern.interval || 1;
      if (pattern.day_of_month) {
        next.setMonth(next.getMonth() + interval);
        // Handle edge case where day doesn't exist in target month
        const targetDay = pattern.day_of_month;
        const lastDayOfMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        next.setDate(Math.min(targetDay, lastDayOfMonth));
      } else {
        // Use same day of month
        next.setMonth(next.getMonth() + interval);
      }
      break;
    }

    case "yearly": {
      const interval = pattern.interval || 1;
      next.setFullYear(next.getFullYear() + interval);
      break;
    }
  }

  // Check if end_date is set and next occurrence exceeds it
  if (pattern.end_date) {
    const endDate = new Date(pattern.end_date);
    if (next > endDate) {
      return null; // Recurrence has ended
    }
  }

  return next;
}

Deno.serve(async (req: Request) => {
  try {
    // Get Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all reminders that are due (reminder_date <= NOW() AND status = 'scheduled')
    const now = new Date().toISOString();
    const { data: dueReminders, error: fetchError } = await supabase
      .from("reminders")
      .select("*")
      .eq("status", "scheduled")
      .lte("reminder_date", now)
      .is("deleted_at", null);

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch reminders", details: fetchError }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!dueReminders || dueReminders.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          reminders_processed: 0,
          notifications_created: 0,
        }),
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

    const reminderUpdates: Array<{
      id: string;
      status: string;
      triggered_at: string;
    }> = [];

    const newReminders: Array<{
      created_by: string;
      assigned_to: string;
      title: string;
      message: string;
      reminder_date: string;
      is_recurring: boolean;
      recurrence_pattern: RecurrencePattern | null;
      priority: string;
      action_required: boolean;
      action_url: string | null;
      data: Record<string, any> | null;
      status: string;
    }> = [];

    // Process each due reminder
    for (const reminder of dueReminders) {
      // Create notification
      notifications.push({
        user_id: reminder.assigned_to,
        type: "reminder",
        title: reminder.title,
        message: reminder.message,
        data: {
          reminder_id: reminder.id,
          priority: reminder.priority,
          action_required: reminder.action_required,
          action_url: reminder.action_url,
          ...(reminder.data || {}),
        },
      });

      // Mark reminder as triggered
      reminderUpdates.push({
        id: reminder.id,
        status: "triggered",
        triggered_at: now,
      });

      // If recurring, create next occurrence
      if (reminder.is_recurring && reminder.recurrence_pattern) {
        const pattern = reminder.recurrence_pattern as RecurrencePattern;
        const currentDate = new Date(reminder.reminder_date);
        const nextDate = calculateNextOccurrence(currentDate, pattern);

        if (nextDate) {
          newReminders.push({
            created_by: reminder.created_by,
            assigned_to: reminder.assigned_to,
            title: reminder.title,
            message: reminder.message,
            reminder_date: nextDate.toISOString(),
            is_recurring: true,
            recurrence_pattern: pattern,
            priority: reminder.priority,
            action_required: reminder.action_required,
            action_url: reminder.action_url,
            data: reminder.data,
            status: "scheduled",
          });
        }
      }
    }

    // Create notifications
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

    // Update reminders to triggered status
    for (const update of reminderUpdates) {
      const { error: updateError } = await supabase
        .from("reminders")
        .update({
          status: update.status,
          triggered_at: update.triggered_at,
        })
        .eq("id", update.id);

      if (updateError) {
        console.error(`Failed to update reminder ${update.id}:`, updateError);
      }
    }

    // Create new recurring reminders
    if (newReminders.length > 0) {
      const { error: insertError } = await supabase
        .from("reminders")
        .insert(newReminders);

      if (insertError) {
        console.error("Failed to create recurring reminders:", insertError);
        // Don't fail the whole operation, just log the error
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_processed: dueReminders.length,
        notifications_created: notifications.length,
        recurring_reminders_created: newReminders.length,
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


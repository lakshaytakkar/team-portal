'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import { requireSuperadmin, requireUserContext } from '@/lib/utils/user-context'
import { resolveProfileId, normalizeOptional } from '@/lib/utils/foreign-keys'
import type {
  Reminder,
  ReminderStatus,
  ReminderPriority,
  CreateReminderInput,
  UpdateReminderInput,
  ReminderFilters,
} from '@/lib/types/reminder'

/**
 * Helper function to transform database reminder to frontend format
 */
function toReminder(row: any): Reminder {
  return {
    id: row.id,
    createdBy: row.created_by,
    assignedTo: row.assigned_to,
    title: row.title,
    message: row.message,
    reminderDate: row.reminder_date,
    isRecurring: row.is_recurring,
    recurrencePattern: row.recurrence_pattern,
    status: row.status,
    priority: row.priority,
    actionRequired: row.action_required,
    actionUrl: row.action_url,
    data: row.data,
    triggeredAt: row.triggered_at || undefined,
    completedAt: row.completed_at || undefined,
    acknowledgedAt: row.acknowledged_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || undefined,
  }
}

/**
 * Create a reminder (Superadmin only)
 */
export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
  const context = await requireSuperadmin()
  const supabase = await createClient()

  try {
    // Resolve assigned_to to UUID
    const assignedToId = await resolveProfileId(input.assignedTo, true)
    if (!assignedToId) {
      throw new Error('Invalid user assigned to reminder')
    }

    // Validate reminder date is in the future
    const reminderDate = new Date(input.reminderDate)
    if (reminderDate <= new Date()) {
      throw new Error('Reminder date must be in the future')
    }

    // Normalize optional fields
    const actionUrl = normalizeOptional(input.actionUrl)
    const data = input.data || null
    const recurrencePattern = input.isRecurring && input.recurrencePattern
      ? input.recurrencePattern
      : null

    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        created_by: context.userId,
        assigned_to: assignedToId,
        title: input.title,
        message: input.message,
        reminder_date: input.reminderDate,
        is_recurring: input.isRecurring || false,
        recurrence_pattern: recurrencePattern,
        priority: input.priority || 'medium',
        action_required: input.actionRequired !== false, // Default true
        action_url: actionUrl,
        data: data,
        status: 'scheduled',
      })
      .select()
      .single()

    if (error) {
      logDatabaseError(error, 'createReminder')
      throw new Error(getUserFriendlyErrorMessage(error))
    }

    revalidatePath('/admin/reminders')
    revalidatePath('/my-reminders')

    return toReminder(reminder)
  } catch (error) {
    logDatabaseError(error, 'createReminder')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Update a reminder (Superadmin only)
 */
export async function updateReminder(
  id: string,
  input: UpdateReminderInput
): Promise<Reminder> {
  await requireSuperadmin()
  const supabase = await createClient()

  try {
    const updateData: any = {}

    if (input.assignedTo !== undefined) {
      const assignedToId = await resolveProfileId(input.assignedTo, true)
      if (!assignedToId) {
        throw new Error('Invalid user assigned to reminder')
      }
      updateData.assigned_to = assignedToId
    }

    if (input.title !== undefined) {
      updateData.title = input.title
    }

    if (input.message !== undefined) {
      updateData.message = input.message
    }

    if (input.reminderDate !== undefined) {
      const reminderDate = new Date(input.reminderDate)
      if (reminderDate <= new Date()) {
        throw new Error('Reminder date must be in the future')
      }
      updateData.reminder_date = input.reminderDate
    }

    if (input.isRecurring !== undefined) {
      updateData.is_recurring = input.isRecurring
      if (!input.isRecurring) {
        updateData.recurrence_pattern = null
      } else if (input.recurrencePattern) {
        updateData.recurrence_pattern = input.recurrencePattern
      }
    } else if (input.recurrencePattern !== undefined) {
      updateData.recurrence_pattern = input.recurrencePattern
    }

    if (input.priority !== undefined) {
      updateData.priority = input.priority
    }

    if (input.actionRequired !== undefined) {
      updateData.action_required = input.actionRequired
    }

    if (input.actionUrl !== undefined) {
      updateData.action_url = normalizeOptional(input.actionUrl)
    }

    if (input.data !== undefined) {
      updateData.data = input.data || null
    }

    if (input.status !== undefined) {
      updateData.status = input.status
    }

    const { data: reminder, error } = await supabase
      .from('reminders')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      logDatabaseError(error, 'updateReminder')
      throw new Error(getUserFriendlyErrorMessage(error))
    }

    if (!reminder) {
      throw new Error('Reminder not found')
    }

    revalidatePath('/admin/reminders')
    revalidatePath('/my-reminders')

    return toReminder(reminder)
  } catch (error) {
    logDatabaseError(error, 'updateReminder')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Delete a reminder (Superadmin only - soft delete)
 */
export async function deleteReminder(id: string): Promise<void> {
  await requireSuperadmin()
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('reminders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)

    if (error) {
      logDatabaseError(error, 'deleteReminder')
      throw new Error(getUserFriendlyErrorMessage(error))
    }

    revalidatePath('/admin/reminders')
    revalidatePath('/my-reminders')
  } catch (error) {
    logDatabaseError(error, 'deleteReminder')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get reminders with filters
 * Superadmin sees all, employees see only their own
 */
export async function getReminders(filters?: ReminderFilters): Promise<Reminder[]> {
  const context = await requireUserContext()
  const supabase = await createClient()

  try {
    let query = supabase
      .from('reminders')
      .select('*')
      .is('deleted_at', null)

    // Employees can only see their own reminders
    if (!context.isSuperadmin) {
      query = query.eq('assigned_to', context.userId)
    } else if (filters?.assignedTo) {
      const assignedToId = await resolveProfileId(filters.assignedTo, false)
      if (assignedToId) {
        query = query.eq('assigned_to', assignedToId)
      }
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }

    if (filters?.createdBy) {
      const createdById = await resolveProfileId(filters.createdBy, false)
      if (createdById) {
        query = query.eq('created_by', createdById)
      }
    }

    if (filters?.isRecurring !== undefined) {
      query = query.eq('is_recurring', filters.isRecurring)
    }

    if (filters?.startDate) {
      query = query.gte('reminder_date', filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte('reminder_date', filters.endDate)
    }

    query = query.order('reminder_date', { ascending: true })

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data: reminders, error } = await query

    if (error) {
      logDatabaseError(error, 'getReminders')
      throw new Error(getUserFriendlyErrorMessage(error))
    }

    if (!reminders) return []

    return reminders.map(toReminder)
  } catch (error) {
    logDatabaseError(error, 'getReminders')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get a single reminder by ID
 */
export async function getReminder(id: string): Promise<Reminder | null> {
  const context = await requireUserContext()
  const supabase = await createClient()

  try {
    let query = supabase
      .from('reminders')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)

    // Employees can only see their own reminders
    if (!context.isSuperadmin) {
      query = query.eq('assigned_to', context.userId)
    }

    const { data: reminder, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      logDatabaseError(error, 'getReminder')
      throw new Error(getUserFriendlyErrorMessage(error))
    }

    if (!reminder) return null

    return toReminder(reminder)
  } catch (error) {
    logDatabaseError(error, 'getReminder')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Mark a reminder as complete (User can mark their own reminders)
 */
export async function markReminderComplete(id: string): Promise<Reminder> {
  const context = await requireUserContext()
  const supabase = await createClient()

  try {
    // Verify user owns this reminder
    const { data: reminder, error: fetchError } = await supabase
      .from('reminders')
      .select('id, assigned_to, status')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !reminder) {
      throw new Error('Reminder not found')
    }

    if (reminder.assigned_to !== context.userId) {
      throw new Error('You can only complete your own reminders')
    }

    if (reminder.status === 'completed') {
      throw new Error('Reminder is already completed')
    }

    const { data: updated, error } = await supabase
      .from('reminders')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('assigned_to', context.userId)
      .select()
      .single()

    if (error) {
      logDatabaseError(error, 'markReminderComplete')
      throw new Error(getUserFriendlyErrorMessage(error))
    }

    revalidatePath('/my-reminders')
    revalidatePath('/admin/reminders')

    return toReminder(updated)
  } catch (error) {
    logDatabaseError(error, 'markReminderComplete')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Acknowledge a reminder (User can acknowledge their own reminders)
 */
export async function acknowledgeReminder(id: string): Promise<Reminder> {
  const context = await requireUserContext()
  const supabase = await createClient()

  try {
    // Verify user owns this reminder
    const { data: reminder, error: fetchError } = await supabase
      .from('reminders')
      .select('id, assigned_to, action_required')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !reminder) {
      throw new Error('Reminder not found')
    }

    if (reminder.assigned_to !== context.userId) {
      throw new Error('You can only acknowledge your own reminders')
    }

    if (!reminder.action_required) {
      throw new Error('This reminder does not require acknowledgment')
    }

    const { data: updated, error } = await supabase
      .from('reminders')
      .update({
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('assigned_to', context.userId)
      .select()
      .single()

    if (error) {
      logDatabaseError(error, 'acknowledgeReminder')
      throw new Error(getUserFriendlyErrorMessage(error))
    }

    revalidatePath('/my-reminders')
    revalidatePath('/admin/reminders')

    return toReminder(updated)
  } catch (error) {
    logDatabaseError(error, 'acknowledgeReminder')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Cancel a reminder (Superadmin only)
 */
export async function cancelReminder(id: string): Promise<Reminder> {
  await requireSuperadmin()
  const supabase = await createClient()

  try {
    const { data: reminder, error } = await supabase
      .from('reminders')
      .update({
        status: 'cancelled',
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      logDatabaseError(error, 'cancelReminder')
      throw new Error(getUserFriendlyErrorMessage(error))
    }

    if (!reminder) {
      throw new Error('Reminder not found')
    }

    revalidatePath('/admin/reminders')
    revalidatePath('/my-reminders')

    return toReminder(reminder)
  } catch (error) {
    logDatabaseError(error, 'cancelReminder')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}


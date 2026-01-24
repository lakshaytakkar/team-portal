'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import type { Notification, CreateNotificationInput, NotificationFilters } from '@/lib/types/notification'

/**
 * Create a notification
 */
export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  const supabase = await createClient()
  
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data || null,
        read: false,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createNotification')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/notifications')
    
    return {
      id: notification.id,
      userId: notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      read: notification.read,
      readAt: notification.read_at || undefined,
      createdAt: notification.created_at,
      updatedAt: notification.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'createNotification')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Not authenticated')
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('user_id', user.id) // Ensure user can only mark their own notifications as read
    
    if (error) {
      logDatabaseError(error, 'markNotificationRead')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/notifications')
  } catch (error) {
    logDatabaseError(error, 'markNotificationRead')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Mark a notification as unread
 */
export async function markNotificationUnread(notificationId: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Not authenticated')
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({
        read: false,
        read_at: null,
      })
      .eq('id', notificationId)
      .eq('user_id', user.id) // Ensure user can only mark their own notifications as unread
    
    if (error) {
      logDatabaseError(error, 'markNotificationUnread')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/notifications')
  } catch (error) {
    logDatabaseError(error, 'markNotificationUnread')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Not authenticated')
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('read', false)
    
    if (error) {
      logDatabaseError(error, 'markAllNotificationsRead')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/notifications')
  } catch (error) {
    logDatabaseError(error, 'markAllNotificationsRead')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get unread notification count for current user
 */
export async function getUnreadNotificationsCount(): Promise<number> {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return 0
    }
    
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)
    
    if (error) {
      logDatabaseError(error, 'getUnreadNotificationsCount')
      return 0
    }
    
    return count || 0
  } catch (error) {
    logDatabaseError(error, 'getUnreadNotificationsCount')
    return 0
  }
}

/**
 * Get notifications for current user with filters
 */
export async function getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Not authenticated')
    }
    
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (filters?.read !== undefined) {
      query = query.eq('read', filters.read)
    }
    
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }
    
    const { data: notifications, error } = await query
    
    if (error) {
      logDatabaseError(error, 'getNotifications')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!notifications) return []
    
    return notifications.map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data,
      read: n.read,
      readAt: n.read_at || undefined,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getNotifications')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Not authenticated')
    }
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id) // Ensure user can only delete their own notifications
    
    if (error) {
      logDatabaseError(error, 'deleteNotification')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/notifications')
  } catch (error) {
    logDatabaseError(error, 'deleteNotification')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}


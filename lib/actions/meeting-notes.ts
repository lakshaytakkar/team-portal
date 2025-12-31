'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import type {
  MeetingNote,
  CreateMeetingNoteInput,
  UpdateMeetingNoteInput,
  MeetingNoteFilters,
} from '@/lib/types/meeting-notes'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  
  return user
}

function transformMeetingNote(row: any): MeetingNote {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    meetingDate: row.meeting_date,
    attendees: row.attendees || undefined,
    tags: row.tags || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ? {
      id: row.created_by.id,
      name: row.created_by.full_name || 'Unknown',
    } : undefined,
    updatedBy: row.updated_by ? {
      id: row.updated_by.id,
      name: row.updated_by.full_name || 'Unknown',
    } : undefined,
    user: row.user ? {
      id: row.user.id,
      name: row.user.full_name || 'Unknown',
      email: row.user.email || undefined,
      avatar: row.user.avatar_url || undefined,
    } : undefined,
  }
}

// ============================================================================
// MEETING NOTES ACTIONS
// ============================================================================

/**
 * Get meeting notes
 */
export async function getMeetingNotes(
  filters?: MeetingNoteFilters,
  userId?: string
): Promise<MeetingNote[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    let query = supabase
      .from('meeting_notes')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url),
        created_by:profiles!meeting_notes_created_by_fkey(id, full_name),
        updated_by:profiles!meeting_notes_updated_by_fkey(id, full_name)
      `)
      .order('meeting_date', { ascending: false })
    
    // Role-based filtering
    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      // For non-superadmin, only show own records
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role !== 'superadmin') {
        query = query.eq('user_id', user.id)
      }
    }
    
    // Apply filters
    if (filters) {
      if (filters.userId && filters.userId.length > 0) {
        query = query.in('user_id', filters.userId)
      }
      
      if (filters.dateFrom) {
        query = query.gte('meeting_date', filters.dateFrom)
      }
      
      if (filters.dateTo) {
        query = query.lte('meeting_date', filters.dateTo)
      }
      
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
      }
    }
    
    const { data, error } = await query
    
    if (error) {
      logDatabaseError(error, 'getMeetingNotes')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map(transformMeetingNote)
  } catch (error) {
    logDatabaseError(error, 'getMeetingNotes')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get meeting note by ID
 */
export async function getMeetingNoteById(id: string): Promise<MeetingNote | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('meeting_notes')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url),
        created_by:profiles!meeting_notes_created_by_fkey(id, full_name),
        updated_by:profiles!meeting_notes_updated_by_fkey(id, full_name)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      logDatabaseError(error, 'getMeetingNoteById')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return transformMeetingNote(data)
  } catch (error) {
    logDatabaseError(error, 'getMeetingNoteById')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Create meeting note
 */
export async function createMeetingNote(input: CreateMeetingNoteInput): Promise<MeetingNote> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // For non-superadmin, only create for self
    let targetUserId = user.id
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'superadmin') {
      // Non-superadmin can only create for themselves
      targetUserId = user.id
    }
    
    const { data, error } = await supabase
      .from('meeting_notes')
      .insert({
        user_id: targetUserId,
        title: input.title,
        content: input.content,
        meeting_date: input.meetingDate,
        attendees: input.attendees ? JSON.parse(JSON.stringify(input.attendees)) : null,
        tags: input.tags || null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url),
        created_by:profiles!meeting_notes_created_by_fkey(id, full_name),
        updated_by:profiles!meeting_notes_updated_by_fkey(id, full_name)
      `)
      .single()
    
    if (error) {
      logDatabaseError(error, 'createMeetingNote')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-meeting-notes')
    revalidatePath('/admin/meeting-notes')
    
    return transformMeetingNote(data)
  } catch (error) {
    logDatabaseError(error, 'createMeetingNote')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Update meeting note
 */
export async function updateMeetingNote(
  id: string,
  input: UpdateMeetingNoteInput
): Promise<MeetingNote> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    const updateData: any = {
      updated_by: user.id,
    }
    
    if (input.title !== undefined) {
      updateData.title = input.title
    }
    if (input.content !== undefined) {
      updateData.content = input.content
    }
    if (input.meetingDate !== undefined) {
      updateData.meeting_date = input.meetingDate
    }
    if (input.attendees !== undefined) {
      updateData.attendees = input.attendees ? JSON.parse(JSON.stringify(input.attendees)) : null
    }
    if (input.tags !== undefined) {
      updateData.tags = input.tags || null
    }
    
    const { data, error } = await supabase
      .from('meeting_notes')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url),
        created_by:profiles!meeting_notes_created_by_fkey(id, full_name),
        updated_by:profiles!meeting_notes_updated_by_fkey(id, full_name)
      `)
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateMeetingNote')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-meeting-notes')
    revalidatePath('/admin/meeting-notes')
    revalidatePath(`/my-meeting-notes/${id}`)
    revalidatePath(`/admin/meeting-notes/${id}`)
    
    return transformMeetingNote(data)
  } catch (error) {
    logDatabaseError(error, 'updateMeetingNote')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Delete meeting note
 */
export async function deleteMeetingNote(id: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('meeting_notes')
      .delete()
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteMeetingNote')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-meeting-notes')
    revalidatePath('/admin/meeting-notes')
  } catch (error) {
    logDatabaseError(error, 'deleteMeetingNote')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}


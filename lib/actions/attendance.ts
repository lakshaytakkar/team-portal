'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import type {
  Attendance,
  AttendanceCorrection,
  CreateAttendanceInput,
  UpdateAttendanceInput,
  CreateCorrectionInput,
  UpdateCorrectionInput,
  AttendanceFilters,
  AttendanceStatus,
  CorrectionStatus,
} from '@/lib/types/attendance'

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

function transformAttendance(row: any): Attendance {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    checkInTime: row.check_in_time || undefined,
    checkOutTime: row.check_out_time || undefined,
    status: row.status as AttendanceStatus,
    workHours: row.work_hours ? parseFloat(row.work_hours) : undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || undefined,
    updatedBy: row.updated_by || undefined,
    user: row.user ? {
      id: row.user.id,
      name: row.user.full_name || 'Unknown',
      email: row.user.email || undefined,
      avatar: row.user.avatar_url || undefined,
    } : undefined,
  }
}

function transformCorrection(row: any): AttendanceCorrection {
  return {
    id: row.id,
    attendanceId: row.attendance_id,
    requestedById: row.requested_by_id,
    requestedDate: row.requested_date,
    requestedCheckIn: row.requested_check_in || undefined,
    requestedCheckOut: row.requested_check_out || undefined,
    reason: row.reason,
    status: row.status as CorrectionStatus,
    reviewedById: row.reviewed_by_id || undefined,
    reviewedAt: row.reviewed_at || undefined,
    reviewNotes: row.review_notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attendance: row.attendance ? transformAttendance(row.attendance) : undefined,
    requestedBy: row.requested_by ? {
      id: row.requested_by.id,
      name: row.requested_by.full_name || 'Unknown',
      email: row.requested_by.email || undefined,
    } : undefined,
    reviewedBy: row.reviewed_by ? {
      id: row.reviewed_by.id,
      name: row.reviewed_by.full_name || 'Unknown',
      email: row.reviewed_by.email || undefined,
    } : undefined,
  }
}

// ============================================================================
// ATTENDANCE ACTIONS
// ============================================================================

/**
 * Get attendance records
 */
export async function getAttendance(
  filters?: AttendanceFilters,
  userId?: string
): Promise<Attendance[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    let query = supabase
      .from('attendance')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
      .order('date', { ascending: false })
    
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
      
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }
      
      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom)
      }
      
      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo)
      }
      
      if (filters.search) {
        query = query.or(`notes.ilike.%${filters.search}%,user.full_name.ilike.%${filters.search}%`)
      }
    }
    
    const { data, error } = await query
    
    if (error) {
      logDatabaseError(error, 'getAttendance')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map(transformAttendance)
  } catch (error) {
    logDatabaseError(error, 'getAttendance')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get attendance by ID
 */
export async function getAttendanceById(id: string): Promise<Attendance | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      logDatabaseError(error, 'getAttendanceById')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return transformAttendance(data)
  } catch (error) {
    logDatabaseError(error, 'getAttendanceById')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Create attendance record
 */
export async function createAttendance(input: CreateAttendanceInput): Promise<Attendance> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        user_id: input.userId,
        date: input.date,
        check_in_time: normalizeOptional(input.checkInTime),
        check_out_time: normalizeOptional(input.checkOutTime),
        status: input.status || 'present',
        notes: normalizeOptional(input.notes),
        created_by: user.id,
        updated_by: user.id,
      })
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
      .single()
    
    if (error) {
      logDatabaseError(error, 'createAttendance')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-attendance')
    revalidatePath('/admin/attendance')
    
    return transformAttendance(data)
  } catch (error) {
    logDatabaseError(error, 'createAttendance')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Update attendance record
 */
export async function updateAttendance(
  id: string,
  input: UpdateAttendanceInput
): Promise<Attendance> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    const updateData: any = {
      updated_by: user.id,
    }
    
    if (input.checkInTime !== undefined) {
      updateData.check_in_time = normalizeOptional(input.checkInTime)
    }
    if (input.checkOutTime !== undefined) {
      updateData.check_out_time = normalizeOptional(input.checkOutTime)
    }
    if (input.status !== undefined) {
      updateData.status = input.status
    }
    if (input.notes !== undefined) {
      updateData.notes = normalizeOptional(input.notes)
    }
    
    const { data, error } = await supabase
      .from('attendance')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateAttendance')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-attendance')
    revalidatePath('/admin/attendance')
    revalidatePath(`/my-attendance/${id}`)
    revalidatePath(`/admin/attendance/${id}`)
    
    return transformAttendance(data)
  } catch (error) {
    logDatabaseError(error, 'updateAttendance')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Delete attendance record
 */
export async function deleteAttendance(id: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteAttendance')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-attendance')
    revalidatePath('/admin/attendance')
  } catch (error) {
    logDatabaseError(error, 'deleteAttendance')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Check in
 */
export async function checkIn(userId: string): Promise<Attendance> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()
    
    // Check if attendance record exists for today
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()
    
    if (existing) {
      // Update existing record
      return await updateAttendance(existing.id, {
        checkInTime: now,
        status: 'present',
      })
    } else {
      // Create new record
      return await createAttendance({
        userId,
        date: today,
        checkInTime: now,
        status: 'present',
      })
    }
  } catch (error) {
    logDatabaseError(error, 'checkIn')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Check out
 */
export async function checkOut(userId: string): Promise<Attendance> {
  const supabase = await createClient()
  
  try {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()
    
    // Find today's attendance record
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()
    
    if (!existing) {
      throw new Error('No check-in record found for today')
    }
    
    return await updateAttendance(existing.id, {
      checkOutTime: now,
    })
  } catch (error) {
    logDatabaseError(error, 'checkOut')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

// ============================================================================
// ATTENDANCE CORRECTION ACTIONS
// ============================================================================

/**
 * Get attendance corrections
 */
export async function getAttendanceCorrections(
  attendanceId?: string
): Promise<AttendanceCorrection[]> {
  const supabase = await createClient()
  
  try {
    let query = supabase
      .from('attendance_corrections')
      .select(`
        *,
        attendance:attendance(*, user:profiles(id, full_name, email, avatar_url)),
        requested_by:profiles!attendance_corrections_requested_by_id_fkey(id, full_name, email),
        reviewed_by:profiles!attendance_corrections_reviewed_by_id_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false })
    
    if (attendanceId) {
      query = query.eq('attendance_id', attendanceId)
    }
    
    const { data, error } = await query
    
    if (error) {
      logDatabaseError(error, 'getAttendanceCorrections')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map(transformCorrection)
  } catch (error) {
    logDatabaseError(error, 'getAttendanceCorrections')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Create attendance correction request
 */
export async function createAttendanceCorrection(
  input: CreateCorrectionInput
): Promise<AttendanceCorrection> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    const { data, error } = await supabase
      .from('attendance_corrections')
      .insert({
        attendance_id: input.attendanceId,
        requested_by_id: user.id,
        requested_date: input.requestedDate,
        requested_check_in: normalizeOptional(input.requestedCheckIn),
        requested_check_out: normalizeOptional(input.requestedCheckOut),
        reason: input.reason,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(`
        *,
        attendance:attendance(*, user:profiles(id, full_name, email, avatar_url)),
        requested_by:profiles!attendance_corrections_requested_by_id_fkey(id, full_name, email)
      `)
      .single()
    
    if (error) {
      logDatabaseError(error, 'createAttendanceCorrection')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-attendance')
    revalidatePath('/admin/attendance')
    
    return transformCorrection(data)
  } catch (error) {
    logDatabaseError(error, 'createAttendanceCorrection')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Update attendance correction (approve/reject)
 */
export async function updateAttendanceCorrection(
  id: string,
  input: UpdateCorrectionInput
): Promise<AttendanceCorrection> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    const updateData: any = {
      status: input.status,
      reviewed_by_id: user.id,
      reviewed_at: new Date().toISOString(),
      updated_by: user.id,
    }
    
    if (input.reviewNotes !== undefined) {
      updateData.review_notes = normalizeOptional(input.reviewNotes)
    }
    
    // If approved, update the attendance record
    if (input.status === 'approved') {
      const { data: correction } = await supabase
        .from('attendance_corrections')
        .select('attendance_id, requested_check_in, requested_check_out')
        .eq('id', id)
        .single()
      
      if (correction) {
        await supabase
          .from('attendance')
          .update({
            check_in_time: correction.requested_check_in || undefined,
            check_out_time: correction.requested_check_out || undefined,
            updated_by: user.id,
          })
          .eq('id', correction.attendance_id)
      }
    }
    
    const { data, error } = await supabase
      .from('attendance_corrections')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        attendance:attendance(*, user:profiles(id, full_name, email, avatar_url)),
        requested_by:profiles!attendance_corrections_requested_by_id_fkey(id, full_name, email),
        reviewed_by:profiles!attendance_corrections_reviewed_by_id_fkey(id, full_name, email)
      `)
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateAttendanceCorrection')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-attendance')
    revalidatePath('/admin/attendance')
    
    return transformCorrection(data)
  } catch (error) {
    logDatabaseError(error, 'updateAttendanceCorrection')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}


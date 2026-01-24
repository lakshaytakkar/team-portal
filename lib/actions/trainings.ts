'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import type {
  Training,
  Playlist,
  TrainingProgress,
  CreateTrainingInput,
  UpdateTrainingInput,
  CreatePlaylistInput,
  UpdatePlaylistInput,
  UpdateTrainingProgressInput,
  TrainingFilters,
  PlaylistFilters,
} from '@/lib/types/trainings'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current user from session
 */
async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  
  return user
}

/**
 * Transform database playlist to frontend playlist
 */
function transformPlaylist(row: any): Playlist {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    orderIndex: row.order_index || 0,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || undefined,
    updatedBy: row.updated_by || undefined,
    trainingCount: row.training_count || undefined,
  }
}

/**
 * Transform database training to frontend training
 */
function transformTraining(row: any): Training {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    category: row.category || undefined,
    duration: row.duration || undefined,
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url || undefined,
    playlistId: row.playlist_id || undefined,
    orderIndex: row.order_index || 0,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || undefined,
    updatedBy: row.updated_by || undefined,
    playlist: row.playlist ? transformPlaylist(row.playlist) : undefined,
    progress: row.progress ? transformTrainingProgress(row.progress) : undefined,
  }
}

/**
 * Transform database training progress to frontend training progress
 */
function transformTrainingProgress(row: any): TrainingProgress {
  return {
    id: row.id,
    userId: row.user_id,
    trainingId: row.training_id,
    status: row.status as 'not-started' | 'in-progress' | 'completed',
    progressPercentage: row.progress_percentage || 0,
    completedAt: row.completed_at || undefined,
    lastAccessedAt: row.last_accessed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    training: row.training ? transformTraining(row.training) : undefined,
    user: row.user ? {
      id: row.user.id,
      name: row.user.full_name || 'Unknown',
      email: row.user.email || undefined,
    } : undefined,
  }
}

// ============================================================================
// PLAYLIST ACTIONS
// ============================================================================

/**
 * Get all playlists
 */
export async function getPlaylists(filters?: PlaylistFilters): Promise<Playlist[]> {
  const supabase = await createClient()
  
  try {
    let query = supabase
      .from('playlists')
      .select(`
        *,
        training_count:training_playlist_items(count)
      `)
      .order('order_index', { ascending: true })
    
    if (filters) {
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
    } else {
      // Default: only active playlists
      query = query.eq('is_active', true)
    }
    
    const { data, error } = await query
    
    if (error) {
      logDatabaseError(error, 'getPlaylists')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => {
      const playlist = transformPlaylist(row)
      // Extract count from nested structure
      if (row.training_count && Array.isArray(row.training_count) && row.training_count.length > 0) {
        playlist.trainingCount = row.training_count[0].count || 0
      }
      return playlist
    })
  } catch (error) {
    logDatabaseError(error, 'getPlaylists')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get playlist by ID
 */
export async function getPlaylistById(id: string): Promise<Playlist | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('playlists')
      .select(`
        *,
        training_count:training_playlist_items(count)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      logDatabaseError(error, 'getPlaylistById')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    const playlist = transformPlaylist(data)
    if (data.training_count && Array.isArray(data.training_count) && data.training_count.length > 0) {
      playlist.trainingCount = data.training_count[0].count || 0
    }
    return playlist
  } catch (error) {
    logDatabaseError(error, 'getPlaylistById')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Create playlist (Admin only)
 */
export async function createPlaylist(input: CreatePlaylistInput): Promise<Playlist> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // Check if user is superadmin (you may want to add role check here)
    
    const { data, error } = await supabase
      .from('playlists')
      .insert({
        name: input.name,
        description: normalizeOptional(input.description),
        order_index: input.orderIndex || 0,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createPlaylist')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/admin/training')
    revalidatePath('/my-training')
    
    return transformPlaylist(data)
  } catch (error) {
    logDatabaseError(error, 'createPlaylist')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Update playlist (Admin only)
 */
export async function updatePlaylist(id: string, input: UpdatePlaylistInput): Promise<Playlist> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    const updateData: any = {
      updated_by: user.id,
    }
    
    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = normalizeOptional(input.description)
    if (input.orderIndex !== undefined) updateData.order_index = input.orderIndex
    if (input.isActive !== undefined) updateData.is_active = input.isActive
    
    const { data, error } = await supabase
      .from('playlists')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updatePlaylist')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/admin/training')
    revalidatePath('/my-training')
    revalidatePath(`/admin/training/${id}`)
    
    return transformPlaylist(data)
  } catch (error) {
    logDatabaseError(error, 'updatePlaylist')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Delete playlist (Admin only)
 */
export async function deletePlaylist(id: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deletePlaylist')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/admin/training')
    revalidatePath('/my-training')
  } catch (error) {
    logDatabaseError(error, 'deletePlaylist')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

// ============================================================================
// TRAINING ACTIONS
// ============================================================================

/**
 * Get trainings with optional user progress
 */
export async function getTrainings(
  filters?: TrainingFilters,
  userId?: string
): Promise<Training[]> {
  const supabase = await createClient()
  
  try {
    let query = supabase
      .from('trainings')
      .select(`
        *,
        playlist:playlists(*)
      `)
      .eq('is_active', true)
      .order('order_index', { ascending: true })
    
    if (filters) {
      if (filters.category && filters.category.length > 0) {
        query = query.in('category', filters.category)
      }
      
      if (filters.playlistId && filters.playlistId.length > 0) {
        query = query.in('playlist_id', filters.playlistId)
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }
    }
    
    const { data: trainings, error } = await query
    
    if (error) {
      logDatabaseError(error, 'getTrainings')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!trainings || trainings.length === 0) {
      return []
    }
    
    // If userId provided, fetch progress for each training
    let progressMap = new Map<string, TrainingProgress>()
    if (userId) {
      const trainingIds = trainings.map((t: any) => t.id)
      const { data: progressData } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', userId)
        .in('training_id', trainingIds)
      
      if (progressData) {
        progressMap = new Map(
          progressData.map((p: any) => [p.training_id, transformTrainingProgress(p)])
        )
      }
    }
    
    // Transform and attach progress
    return trainings.map((row: any) => {
      const training = transformTraining(row)
      if (userId && progressMap.has(training.id)) {
        training.progress = progressMap.get(training.id)
      }
      return training
    })
  } catch (error) {
    logDatabaseError(error, 'getTrainings')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get training by ID with optional user progress
 */
export async function getTrainingById(id: string, userId?: string): Promise<Training | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('trainings')
      .select(`
        *,
        playlist:playlists(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      logDatabaseError(error, 'getTrainingById')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    const training = transformTraining(data)
    
    // Fetch progress if userId provided
    if (userId) {
      const { data: progressData } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('training_id', id)
        .single()
      
      if (progressData) {
        training.progress = transformTrainingProgress(progressData)
      }
    }
    
    return training
  } catch (error) {
    logDatabaseError(error, 'getTrainingById')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Create training (Admin only)
 */
export async function createTraining(input: CreateTrainingInput): Promise<Training> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    const { data, error } = await supabase
      .from('trainings')
      .insert({
        title: input.title,
        description: normalizeOptional(input.description),
        category: normalizeOptional(input.category),
        duration: normalizeOptional(input.duration),
        video_url: input.videoUrl,
        thumbnail_url: normalizeOptional(input.thumbnailUrl),
        playlist_id: normalizeOptional(input.playlistId),
        order_index: input.orderIndex || 0,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(`
        *,
        playlist:playlists(*)
      `)
      .single()
    
    if (error) {
      logDatabaseError(error, 'createTraining')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/admin/training')
    revalidatePath('/my-training')
    
    return transformTraining(data)
  } catch (error) {
    logDatabaseError(error, 'createTraining')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Update training (Admin only)
 */
export async function updateTraining(id: string, input: UpdateTrainingInput): Promise<Training> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    const updateData: any = {
      updated_by: user.id,
    }
    
    if (input.title !== undefined) updateData.title = input.title
    if (input.description !== undefined) updateData.description = normalizeOptional(input.description)
    if (input.category !== undefined) updateData.category = normalizeOptional(input.category)
    if (input.duration !== undefined) updateData.duration = normalizeOptional(input.duration)
    if (input.videoUrl !== undefined) updateData.video_url = input.videoUrl
    if (input.thumbnailUrl !== undefined) updateData.thumbnail_url = normalizeOptional(input.thumbnailUrl)
    if (input.playlistId !== undefined) updateData.playlist_id = normalizeOptional(input.playlistId)
    if (input.orderIndex !== undefined) updateData.order_index = input.orderIndex
    if (input.isActive !== undefined) updateData.is_active = input.isActive
    
    const { data, error } = await supabase
      .from('trainings')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        playlist:playlists(*)
      `)
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateTraining')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/admin/training')
    revalidatePath('/my-training')
    revalidatePath(`/admin/training/${id}`)
    revalidatePath(`/my-training/${id}`)
    
    return transformTraining(data)
  } catch (error) {
    logDatabaseError(error, 'updateTraining')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Delete training (Admin only)
 */
export async function deleteTraining(id: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('trainings')
      .delete()
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteTraining')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/admin/training')
    revalidatePath('/my-training')
  } catch (error) {
    logDatabaseError(error, 'deleteTraining')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

// ============================================================================
// TRAINING PROGRESS ACTIONS
// ============================================================================

/**
 * Get training progress for a user
 */
export async function getTrainingProgress(
  userId: string,
  trainingId?: string
): Promise<TrainingProgress[]> {
  const supabase = await createClient()
  
  try {
    let query = supabase
      .from('training_progress')
      .select(`
        *,
        training:trainings(*)
      `)
      .eq('user_id', userId)
    
    if (trainingId) {
      query = query.eq('training_id', trainingId)
    }
    
    const { data, error } = await query
    
    if (error) {
      logDatabaseError(error, 'getTrainingProgress')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map(transformTrainingProgress)
  } catch (error) {
    logDatabaseError(error, 'getTrainingProgress')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Update training progress
 */
export async function updateTrainingProgress(
  userId: string,
  input: UpdateTrainingProgressInput
): Promise<TrainingProgress> {
  const supabase = await createClient()
  
  try {
    // Check if progress record exists
    const { data: existing } = await supabase
      .from('training_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('training_id', input.trainingId)
      .single()
    
    let progressData: any
    
    if (existing) {
      // Update existing
      const updateData: any = {}
      
      if (input.progressPercentage !== undefined) {
        updateData.progress_percentage = Math.max(0, Math.min(100, input.progressPercentage))
      }
      
      if (input.status !== undefined) {
        updateData.status = input.status
        // If marking as completed, set progress to 100
        if (input.status === 'completed') {
          updateData.progress_percentage = 100
        }
      }
      
      const { data, error } = await supabase
        .from('training_progress')
        .update(updateData)
        .eq('id', existing.id)
        .select(`
          *,
          training:trainings(*)
        `)
        .single()
      
      if (error) {
        logDatabaseError(error, 'updateTrainingProgress')
        throw new Error(getUserFriendlyErrorMessage(error))
      }
      
      progressData = data
    } else {
      // Create new progress record
      const insertData: any = {
        user_id: userId,
        training_id: input.trainingId,
        status: input.status || 'in-progress',
        progress_percentage: input.progressPercentage || 0,
      }
      
      const { data, error } = await supabase
        .from('training_progress')
        .insert(insertData)
        .select(`
          *,
          training:trainings(*)
        `)
        .single()
      
      if (error) {
        logDatabaseError(error, 'updateTrainingProgress')
        throw new Error(getUserFriendlyErrorMessage(error))
      }
      
      progressData = data
    }
    
    revalidatePath('/my-training')
    revalidatePath(`/my-training/${input.trainingId}`)
    
    return transformTrainingProgress(progressData)
  } catch (error) {
    logDatabaseError(error, 'updateTrainingProgress')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get all user progress for admin view
 */
export async function getAllTrainingProgress(
  trainingId?: string
): Promise<TrainingProgress[]> {
  const supabase = await createClient()
  
  try {
    let query = supabase
      .from('training_progress')
      .select(`
        *,
        training:trainings(*),
        user:profiles(id, full_name, email)
      `)
    
    if (trainingId) {
      query = query.eq('training_id', trainingId)
    }
    
    const { data, error } = await query
    
    if (error) {
      logDatabaseError(error, 'getAllTrainingProgress')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map(transformTrainingProgress)
  } catch (error) {
    logDatabaseError(error, 'getAllTrainingProgress')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}


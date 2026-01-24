export type TrainingStatus = "not-started" | "in-progress" | "completed"

export interface Playlist {
  id: string
  name: string
  description?: string
  orderIndex: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  trainingCount?: number // Computed: number of trainings in playlist
}

export interface Training {
  id: string
  title: string
  description?: string
  category?: string
  duration?: number // Duration in minutes
  videoUrl: string
  thumbnailUrl?: string
  playlistId?: string
  orderIndex: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  // Related data
  playlist?: Playlist
  progress?: TrainingProgress
}

export interface TrainingProgress {
  id: string
  userId: string
  trainingId: string
  status: TrainingStatus
  progressPercentage: number // 0-100
  completedAt?: string
  lastAccessedAt: string
  createdAt: string
  updatedAt: string
  // Related data
  training?: Training
  user?: {
    id: string
    name: string
    email?: string
  }
}

export interface TrainingPlaylistItem {
  id: string
  playlistId: string
  trainingId: string
  orderIndex: number
  createdAt: string
  // Related data
  playlist?: Playlist
  training?: Training
}

// Input types for creating/updating
export interface CreateTrainingInput {
  title: string
  description?: string
  category?: string
  duration?: number
  videoUrl: string
  thumbnailUrl?: string
  playlistId?: string
  orderIndex?: number
}

export interface UpdateTrainingInput {
  title?: string
  description?: string
  category?: string
  duration?: number
  videoUrl?: string
  thumbnailUrl?: string
  playlistId?: string
  orderIndex?: number
  isActive?: boolean
}

export interface CreatePlaylistInput {
  name: string
  description?: string
  orderIndex?: number
}

export interface UpdatePlaylistInput {
  name?: string
  description?: string
  orderIndex?: number
  isActive?: boolean
}

export interface UpdateTrainingProgressInput {
  trainingId: string
  progressPercentage?: number
  status?: TrainingStatus
}

// Filter types
export interface TrainingFilters {
  search?: string
  category?: string[]
  playlistId?: string[]
  status?: TrainingStatus[] // For user's progress status
  isActive?: boolean
}

export interface PlaylistFilters {
  search?: string
  isActive?: boolean
}


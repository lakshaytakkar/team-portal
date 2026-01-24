'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Asset, AssetType, AssetStatus, AssetAssignment, HRUser } from '@/lib/types/hr'
import { resolveProfileId, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import { getAvatarForUser } from '@/lib/utils/avatars'
import { createNotification } from '@/lib/actions/notifications'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function toHRUser(profile: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null): HRUser | undefined {
  if (!profile) return undefined
  return {
    id: profile.id,
    name: profile.full_name ?? 'Unknown',
    email: profile.email,
    avatar: profile.avatar_url ?? getAvatarForUser(profile.full_name ?? 'U'),
  }
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all asset types for dropdowns
 */
export async function getAssetTypes(): Promise<AssetType[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('asset_types')
    .select('id, name, icon')
    .order('name', { ascending: true })

  if (error) {
    logDatabaseError(error, 'getAssetTypes')
    throw new Error(`Failed to fetch asset types: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    icon: row.icon ?? undefined,
  }))
}

/**
 * Get all assets with relations
 */
export async function getAssets(): Promise<Asset[]> {
  const supabase = await createClient()

  try {
    // Get all assets with their types
    const { data: assetsData, error: assetsError } = await supabase
      .from('assets')
      .select(`
        *,
        asset_type:asset_types(id, name, icon)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (assetsError) {
      logDatabaseError(assetsError, 'getAssets')
      throw new Error(`Failed to fetch assets: ${assetsError.message}`)
    }
    if (!assetsData) return []

    // Get current assignments for all assets
    const assetIds = assetsData.map((a: any) => a.id).filter(Boolean)
    let assignmentsData: any[] = []
    
    if (assetIds.length > 0) {
      const { data: assignments, error: assignmentsError } = await supabase
        .from('asset_assignments')
        .select(`
          *,
          employee:employees(
            id,
            profile:profiles(id, full_name, email, avatar_url)
          ),
          assigned_by_profile:profiles!asset_assignments_assigned_by_fkey(id, full_name, email, avatar_url)
        `)
        .in('asset_id', assetIds)
        .is('return_date', null) // Only current assignments

      if (!assignmentsError && assignments) {
        assignmentsData = assignments
      }
    }

    // Map assignments by asset_id
    const assignmentsByAssetId = new Map<string, any>()
    assignmentsData.forEach((assignment: any) => {
      assignmentsByAssetId.set(assignment.asset_id, assignment)
    })

    return assetsData.map((row: any) => {
      const currentAssignment = assignmentsByAssetId.get(row.id)
      const assignedTo = currentAssignment?.employee?.profile
        ? toHRUser(currentAssignment.employee.profile)
        : undefined

      return {
        id: row.id,
        name: row.name,
        assetType: {
          id: row.asset_type.id,
          name: row.asset_type.name,
          icon: row.asset_type.icon ?? undefined,
        },
        serialNumber: row.serial_number ?? undefined,
        purchaseDate: row.purchase_date ?? undefined,
        purchasePrice: row.purchase_price ? Number(row.purchase_price) : undefined,
        status: row.status as AssetStatus,
        imageUrl: row.image_url,
        notes: row.notes ?? undefined,
        assignedTo,
        assignmentDate: currentAssignment?.assigned_date ?? undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    })
  } catch (error) {
    logDatabaseError(error, 'getAssets')
    throw error
  }
}

/**
 * Get asset by ID with full details
 */
export async function getAssetById(id: string): Promise<Asset | null> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('assets')
      .select(`
        *,
        asset_type:asset_types(id, name, icon)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      logDatabaseError(error, 'getAssetById')
      throw new Error(`Failed to fetch asset: ${error.message}`)
    }
    if (!data) return null

    // Get current assignment if exists
    const { data: assignment } = await supabase
      .from('asset_assignments')
      .select(`
        *,
        employee:employees(
          id,
          profile:profiles(id, full_name, email, avatar_url)
        )
      `)
      .eq('asset_id', id)
      .is('return_date', null)
      .single()

    const assignedTo = assignment?.employee?.profile
      ? toHRUser(assignment.employee.profile)
      : undefined

    return {
      id: data.id,
      name: data.name,
      assetType: {
        id: data.asset_type.id,
        name: data.asset_type.name,
        icon: data.asset_type.icon ?? undefined,
      },
      serialNumber: data.serial_number ?? undefined,
      purchaseDate: data.purchase_date ?? undefined,
      purchasePrice: data.purchase_price ? Number(data.purchase_price) : undefined,
      status: data.status as AssetStatus,
      imageUrl: data.image_url,
      notes: data.notes ?? undefined,
      assignedTo,
      assignmentDate: assignment?.assigned_date ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'getAssetById')
    throw error
  }
}

/**
 * Get assignment history for an asset
 */
export async function getAssetAssignments(assetId?: string): Promise<AssetAssignment[]> {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('asset_assignments')
      .select(`
        *,
        asset:assets(
          id,
          name,
          asset_type:asset_types(id, name, icon)
        ),
        employee:employees(
          id,
          employee_id,
          profile:profiles(id, full_name, email, avatar_url)
        ),
        assigned_by_profile:profiles!asset_assignments_assigned_by_fkey(id, full_name, email, avatar_url)
      `)
      .order('assigned_date', { ascending: false })

    if (assetId) {
      query = query.eq('asset_id', assetId)
    }

    const { data, error } = await query

    if (error) {
      logDatabaseError(error, 'getAssetAssignments')
      throw new Error(`Failed to fetch assignments: ${error.message}`)
    }
    if (!data) return []

    return (data || []).map((row: any) => ({
      id: row.id,
      asset: {
        id: row.asset.id,
        name: row.asset.name,
        assetType: {
          id: row.asset.asset_type.id,
          name: row.asset.asset_type.name,
          icon: row.asset.asset_type.icon ?? undefined,
        },
        status: 'assigned' as AssetStatus,
        imageUrl: '',
        createdAt: '',
        updatedAt: '',
      },
      employee: {
        id: row.employee.id,
        employeeId: row.employee.employee_id,
        fullName: row.employee.profile?.full_name ?? '',
        email: row.employee.profile?.email ?? '',
        status: 'active' as any,
        roleType: 'internal' as any,
        department: row.employee.department?.name ?? '',
        position: row.employee.position?.title ?? '',
        hireDate: '',
        createdAt: '',
        updatedAt: '',
      },
      assignedDate: row.assigned_date,
      returnDate: row.return_date ?? undefined,
      assignedBy: toHRUser(row.assigned_by_profile),
      returnNotes: row.return_notes ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getAssetAssignments')
    throw error
  }
}

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

interface CreateAssetInput {
  name: string
  assetTypeId: string
  serialNumber?: string
  purchaseDate?: string
  purchasePrice?: number
  imageUrl: string // Required - uploaded before calling this
  notes?: string
}

/**
 * Create a new asset
 */
export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  const supabase = await createClient()

  try {
    // Normalize optional fields
    const serialNumber = normalizeOptional(input.serialNumber)
    const purchaseDate = normalizeOptional(input.purchaseDate)
    const purchasePrice = normalizeOptional(input.purchasePrice)
    const notes = normalizeOptional(input.notes)

    // Validate required fields
    if (!input.name || !input.assetTypeId || !input.imageUrl) {
      throw new Error('Name, asset type, and image are required')
    }

    // Get current user for created_by
    const { data: { user } } = await supabase.auth.getUser()
    const createdBy = user?.id ?? null

    // Create asset
    const { data: newAsset, error: assetError } = await supabase
      .from('assets')
      .insert({
        name: input.name,
        asset_type_id: input.assetTypeId,
        serial_number: serialNumber,
        purchase_date: purchaseDate,
        purchase_price: purchasePrice,
        image_url: input.imageUrl,
        notes,
        status: 'available',
        created_by: createdBy,
        updated_by: createdBy,
      })
      .select(`
        *,
        asset_type:asset_types(id, name, icon)
      `)
      .single()

    if (assetError) {
      logDatabaseError(assetError, 'createAsset')
      throw new Error(getUserFriendlyErrorMessage(assetError))
    }

    if (!newAsset) {
      throw new Error('Failed to create asset')
    }

    revalidatePath('/hr/assets')

    return {
      id: newAsset.id,
      name: newAsset.name,
      assetType: {
        id: newAsset.asset_type.id,
        name: newAsset.asset_type.name,
        icon: newAsset.asset_type.icon ?? undefined,
      },
      serialNumber: newAsset.serial_number ?? undefined,
      purchaseDate: newAsset.purchase_date ?? undefined,
      purchasePrice: newAsset.purchase_price ? Number(newAsset.purchase_price) : undefined,
      status: newAsset.status as AssetStatus,
      imageUrl: newAsset.image_url,
      notes: newAsset.notes ?? undefined,
      createdAt: newAsset.created_at,
      updatedAt: newAsset.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'createAsset')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

interface UpdateAssetInput {
  id: string
  name?: string
  assetTypeId?: string
  serialNumber?: string
  purchaseDate?: string
  purchasePrice?: number
  imageUrl?: string
  notes?: string
  status?: AssetStatus
}

/**
 * Update an asset
 */
export async function updateAsset(input: UpdateAssetInput): Promise<Asset> {
  const supabase = await createClient()

  try {
    // Normalize optional fields
    const serialNumber = normalizeOptional(input.serialNumber)
    const purchaseDate = normalizeOptional(input.purchaseDate)
    const purchasePrice = normalizeOptional(input.purchasePrice)
    const notes = normalizeOptional(input.notes)

    // Get current user for updated_by
    const { data: { user } } = await supabase.auth.getUser()
    const updatedBy = user?.id ?? null

    // Get existing asset to check status change
    const { data: existingAsset } = await supabase
      .from('assets')
      .select('status, name')
      .eq('id', input.id)
      .single()

    // Build update object
    const updateData: any = {
      updated_by: updatedBy,
    }

    if (input.name !== undefined) updateData.name = input.name
    if (input.assetTypeId !== undefined) updateData.asset_type_id = input.assetTypeId
    if (serialNumber !== undefined) updateData.serial_number = serialNumber
    if (purchaseDate !== undefined) updateData.purchase_date = purchaseDate
    if (purchasePrice !== undefined) updateData.purchase_price = purchasePrice
    if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl
    if (notes !== undefined) updateData.notes = notes
    if (input.status !== undefined) updateData.status = input.status

    const { data: updatedAsset, error: assetError } = await supabase
      .from('assets')
      .update(updateData)
      .eq('id', input.id)
      .is('deleted_at', null)
      .select(`
        *,
        asset_type:asset_types(id, name, icon)
      `)
      .single()

    if (assetError) {
      logDatabaseError(assetError, 'updateAsset')
      throw new Error(getUserFriendlyErrorMessage(assetError))
    }

    if (!updatedAsset) {
      throw new Error('Asset not found')
    }

    // Notify HR when asset status changes to maintenance
    if (input.status === 'maintenance' && existingAsset && existingAsset.status !== 'maintenance') {
      const { data: hrDepartment } = await supabase
        .from('departments')
        .select('id')
        .eq('code', 'hr')
        .single()

      if (hrDepartment) {
        const { data: hrUsers } = await supabase
          .from('profiles')
          .select('id')
          .eq('department_id', hrDepartment.id)
          .eq('is_active', true)

        if (hrUsers && hrUsers.length > 0) {
          const assetName = updatedAsset.name || existingAsset.name
          for (const hrUser of hrUsers) {
            try {
              await createNotification({
                userId: hrUser.id,
                type: 'asset_maintenance',
                title: 'Asset Under Maintenance',
                message: `Asset ${assetName} has been marked for maintenance`,
                data: {
                  asset_id: input.id,
                  asset_name: assetName,
                  status: 'maintenance',
                },
              })
            } catch (notificationError) {
              logDatabaseError(notificationError, 'updateAsset - maintenance notification creation')
            }
          }
        }
      }
    }

    revalidatePath('/hr/assets')

    // Fetch complete asset with relations
    const result = await getAssetById(updatedAsset.id)
    if (!result) throw new Error('Failed to fetch updated asset')
    return result
  } catch (error) {
    logDatabaseError(error, 'updateAsset')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Assign asset to employee
 */
export async function assignAsset(
  assetId: string,
  employeeId: string,
  assignedDate: string = new Date().toISOString().split('T')[0]
): Promise<void> {
  const supabase = await createClient()

  try {
    // Validate required fields
    if (!assetId || !employeeId) {
      throw new Error('Asset ID and Employee ID are required')
    }

    // Get current user for assigned_by
    const { data: { user } } = await supabase.auth.getUser()
    const assignedBy = user?.id ?? null

    // Check if asset is already assigned
    const { data: existingAssignment } = await supabase
      .from('asset_assignments')
      .select('id')
      .eq('asset_id', assetId)
      .is('return_date', null)
      .single()

    if (existingAssignment) {
      throw new Error('Asset is already assigned to another employee')
    }

    // Create assignment
    const { error: assignmentError } = await supabase
      .from('asset_assignments')
      .insert({
        asset_id: assetId,
        employee_id: employeeId,
        assigned_date: assignedDate,
        assigned_by: assignedBy,
      })

    if (assignmentError) {
      logDatabaseError(assignmentError, 'assignAsset')
      throw new Error(getUserFriendlyErrorMessage(assignmentError))
    }

    // Update asset status
    const { error: statusError } = await supabase
      .from('assets')
      .update({ status: 'assigned' })
      .eq('id', assetId)

    if (statusError) {
      logDatabaseError(statusError, 'assignAsset')
      // Don't fail if status update fails, assignment was successful
    }

    // Get asset and employee details for notification
    const { data: assetData } = await supabase
      .from('assets')
      .select('name, asset_type:asset_types(name)')
      .eq('id', assetId)
      .single()

    const { data: employeeData } = await supabase
      .from('employees')
      .select('profile_id')
      .eq('id', employeeId)
      .single()

    // Notify employee when asset is assigned
    if (employeeData?.profile_id && assetData) {
      try {
        await createNotification({
          userId: employeeData.profile_id,
          type: 'asset_assigned',
          title: 'Asset Assigned',
          message: `You have been assigned ${assetData.name}${assetData.asset_type?.[0] ? ` (${assetData.asset_type[0].name})` : ''}`,
          data: {
            asset_id: assetId,
            asset_name: assetData.name,
            asset_type: assetData.asset_type?.[0]?.name,
            employee_id: employeeId,
            assigned_date: assignedDate,
          },
        })
      } catch (notificationError) {
        logDatabaseError(notificationError, 'assignAsset - notification creation')
      }
    }

    revalidatePath('/hr/assets')
  } catch (error) {
    logDatabaseError(error, 'assignAsset')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Unassign asset (return to available)
 */
export async function unassignAsset(
  assignmentId: string,
  returnNotes?: string
): Promise<void> {
  const supabase = await createClient()

  try {
    // Get assignment to find asset_id and employee_id
    const { data: assignment, error: fetchError } = await supabase
      .from('asset_assignments')
      .select('asset_id, employee_id')
      .eq('id', assignmentId)
      .single()

    if (fetchError || !assignment) {
      throw new Error('Assignment not found')
    }

    // Update assignment with return date
    const normalizedNotes = normalizeOptional(returnNotes)
    const { error: returnError } = await supabase
      .from('asset_assignments')
      .update({
        return_date: new Date().toISOString().split('T')[0],
        return_notes: normalizedNotes,
      })
      .eq('id', assignmentId)

    if (returnError) {
      logDatabaseError(returnError, 'unassignAsset')
      throw new Error(getUserFriendlyErrorMessage(returnError))
    }

    // Update asset status to available
    const { error: statusError } = await supabase
      .from('assets')
      .update({ status: 'available' })
      .eq('id', assignment.asset_id)

    if (statusError) {
      logDatabaseError(statusError, 'unassignAsset')
      // Don't fail if status update fails, unassignment was successful
    }

    // Get asset and employee details for notifications
    const { data: assetData } = await supabase
      .from('assets')
      .select('name, asset_type:asset_types(name)')
      .eq('id', assignment.asset_id)
      .single()

    const { data: employeeData } = await supabase
      .from('employees')
      .select('profile_id')
      .eq('id', assignment.employee_id)
      .single()

    // Notify employee when asset is returned
    if (employeeData?.profile_id && assetData) {
      try {
        await createNotification({
          userId: employeeData.profile_id,
          type: 'asset_returned',
          title: 'Asset Returned',
          message: `Asset ${assetData.name}${assetData.asset_type?.[0] ? ` (${assetData.asset_type[0].name})` : ''} has been returned`,
          data: {
            asset_id: assignment.asset_id,
            asset_name: assetData.name,
            asset_type: assetData.asset_type?.[0]?.name,
            employee_id: assignment.employee_id,
            return_date: new Date().toISOString().split('T')[0],
            return_notes: returnNotes,
          },
        })
      } catch (notificationError) {
        logDatabaseError(notificationError, 'unassignAsset - employee notification creation')
      }
    }

    // Notify HR department users
    const { data: hrDepartment } = await supabase
      .from('departments')
      .select('id')
      .eq('code', 'hr')
      .single()

    if (hrDepartment) {
      const { data: hrUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('department_id', hrDepartment.id)
        .eq('is_active', true)

      if (hrUsers && hrUsers.length > 0 && assetData) {
        for (const hrUser of hrUsers) {
          try {
            await createNotification({
              userId: hrUser.id,
              type: 'asset_returned',
              title: 'Asset Returned',
              message: `Asset ${assetData.name} has been returned by employee`,
              data: {
                asset_id: assignment.asset_id,
                asset_name: assetData.name,
                employee_id: assignment.employee_id,
                return_date: new Date().toISOString().split('T')[0],
              },
            })
          } catch (notificationError) {
            logDatabaseError(notificationError, 'unassignAsset - HR notification creation')
          }
        }
      }
    }

    revalidatePath('/hr/assets')
  } catch (error) {
    logDatabaseError(error, 'unassignAsset')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Delete asset (soft delete)
 */
export async function deleteAsset(id: string): Promise<void> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('assets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)

    if (error) {
      logDatabaseError(error, 'deleteAsset')
      throw new Error(getUserFriendlyErrorMessage(error))
    }

    revalidatePath('/hr/assets')
  } catch (error) {
    logDatabaseError(error, 'deleteAsset')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Upload image to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadAssetImage(file: File, assetId?: string): Promise<string> {
  const supabase = await createClient()

  try {
    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = assetId ? `assets/${assetId}/${filename}` : `assets/${filename}`

    // Upload to Supabase Storage bucket 'assets'
    const { data, error } = await supabase.storage
      .from('assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      logDatabaseError(error, 'uploadAssetImage')
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get image URL')
    }

    return urlData.publicUrl
  } catch (error) {
    logDatabaseError(error, 'uploadAssetImage')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}


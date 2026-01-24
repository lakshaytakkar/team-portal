'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logDatabaseError, getUserFriendlyErrorMessage } from '@/lib/utils/errors'
import { normalizeOptional } from '@/lib/utils/foreign-keys'
import type { AssetAssignment, Asset, HRUser } from '@/lib/types/hr'
import { getAvatarForUser } from '@/lib/utils/avatars'

/**
 * Helper function to convert profile to HRUser
 */
function toHRUser(profile: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null): HRUser | undefined {
  if (!profile) return undefined
  return {
    id: profile.id,
    name: profile.full_name ?? 'Unknown',
    email: profile.email,
    avatar: profile.avatar_url ?? getAvatarForUser(profile.full_name ?? 'U'),
  }
}

/**
 * Get all asset assignments for an employee (current and historical)
 */
export async function getEmployeeAssets(employeeId: string): Promise<{
  current: AssetAssignment[]
  historical: AssetAssignment[]
}> {
  const supabase = await createClient()

  try {
    // Get all assignments for this employee
    const { data: assignments, error } = await supabase
      .from('asset_assignments')
      .select(`
        *,
        asset:assets(
          id,
          name,
          asset_type:asset_types(id, name, icon),
          serial_number,
          image_url
        ),
        employee:employees(
          id,
          employee_id,
          profile:profiles(id, full_name, email, avatar_url)
        ),
        assigned_by_profile:profiles!asset_assignments_assigned_by_fkey(id, full_name, email, avatar_url)
      `)
      .eq('employee_id', employeeId)
      .order('assigned_date', { ascending: false })

    if (error) {
      logDatabaseError(error, 'getEmployeeAssets')
      throw new Error(`Failed to fetch asset assignments: ${error.message}`)
    }

    if (!assignments) {
      return { current: [], historical: [] }
    }

    // Separate current and historical assignments
    const current: AssetAssignment[] = []
    const historical: AssetAssignment[] = []

    assignments.forEach((row: any) => {
      const assignment: AssetAssignment = {
        id: row.id,
        asset: {
          id: row.asset.id,
          name: row.asset.name,
          assetType: {
            id: row.asset.asset_type.id,
            name: row.asset.asset_type.name,
            icon: row.asset.asset_type.icon ?? undefined,
          },
          serialNumber: row.asset.serial_number ?? undefined,
          purchaseDate: undefined,
          purchasePrice: undefined,
          status: 'assigned',
          imageUrl: row.asset.image_url,
          notes: undefined,
          assignedTo: {
            id: row.employee.profile.id,
            name: row.employee.profile.full_name || 'Unknown',
            email: row.employee.profile.email,
          },
          assignmentDate: row.assigned_date,
          createdAt: '',
          updatedAt: '',
        },
        employee: {
          id: row.employee.id,
          employeeId: row.employee.employee_id,
          fullName: row.employee.profile.full_name || 'Unknown',
          email: row.employee.profile.email,
          phone: undefined,
          department: '',
          position: '',
          status: 'active',
          roleType: 'internal',
          hireDate: '',
          avatar: row.employee.profile.avatar_url ?? undefined,
          createdAt: '',
          updatedAt: '',
        },
        assignedDate: row.assigned_date,
        returnDate: row.return_date ?? undefined,
        assignedBy: toHRUser(row.assigned_by_profile),
        returnNotes: row.return_notes ?? undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }

      if (row.return_date === null) {
        current.push(assignment)
      } else {
        historical.push(assignment)
      }
    })

    return { current, historical }
  } catch (error) {
    logDatabaseError(error, 'getEmployeeAssets')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Return an asset (unassign from employee)
 */
export async function returnEmployeeAsset(
  assignmentId: string,
  returnNotes?: string
): Promise<void> {
  const supabase = await createClient()

  try {
    // Validate required fields
    if (!assignmentId) {
      throw new Error('Assignment ID is required')
    }

    // Get assignment to verify it exists and get employee_id for revalidation
    const { data: assignment, error: fetchError } = await supabase
      .from('asset_assignments')
      .select('employee_id, asset_id, return_date')
      .eq('id', assignmentId)
      .single()

    if (fetchError || !assignment) {
      throw new Error('Asset assignment not found')
    }

    if (assignment.return_date !== null) {
      throw new Error('Asset is already returned')
    }

    // Update assignment with return date
    const { error: updateError } = await supabase
      .from('asset_assignments')
      .update({
        return_date: new Date().toISOString().split('T')[0],
        return_notes: normalizeOptional(returnNotes),
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignmentId)

    if (updateError) {
      logDatabaseError(updateError, 'returnEmployeeAsset')
      throw new Error(getUserFriendlyErrorMessage(updateError))
    }

    // Update asset status to 'available'
    const { error: assetUpdateError } = await supabase
      .from('assets')
      .update({ status: 'available' })
      .eq('id', assignment.asset_id)

    if (assetUpdateError) {
      // Log but don't fail - assignment was updated successfully
      console.warn('Failed to update asset status:', assetUpdateError)
    }

    revalidatePath(`/hr/employees/${assignment.employee_id}`)
    revalidatePath('/hr/assets')
  } catch (error) {
    logDatabaseError(error, 'returnEmployeeAsset')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

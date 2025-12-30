/**
 * Migration script to migrate existing employees to new hierarchy structure
 * 
 * This script:
 * 1. Seeds verticals and roles from seed data
 * 2. Auto-creates teams for each department × vertical combination
 * 3. Migrates existing employees to positions
 * 
 * Run this script once after creating the database tables.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { seedVerticals } from '@/lib/data/seed-verticals'
import { seedRoles } from '@/lib/data/seed-roles'
import { getOrCreateTeam, resolveVerticalId, resolveRoleId } from '@/lib/utils/foreign-keys'

interface MigrationResult {
  success: boolean
  message: string
  stats: {
    verticalsCreated: number
    rolesCreated: number
    teamsCreated: number
    employeesMigrated: number
    errors: string[]
  }
}

export async function migrateToHierarchy(): Promise<MigrationResult> {
  const supabase = await createClient()
  const stats = {
    verticalsCreated: 0,
    rolesCreated: 0,
    teamsCreated: 0,
    employeesMigrated: 0,
    errors: [] as string[],
  }

  try {
    // Step 1: Seed verticals
    console.log('Seeding verticals...')
    for (const vertical of seedVerticals) {
      try {
        const { data: existing } = await supabase
          .from('verticals')
          .select('id')
          .eq('name', vertical.name)
          .is('deleted_at', null)
          .single()

        if (!existing) {
          const { error } = await supabase.from('verticals').insert({
            name: vertical.name,
            code: vertical.code,
            description: vertical.description,
            is_active: true,
          })

          if (error) {
            stats.errors.push(`Failed to create vertical ${vertical.name}: ${error.message}`)
          } else {
            stats.verticalsCreated++
          }
        }
      } catch (error: any) {
        stats.errors.push(`Error seeding vertical ${vertical.name}: ${error.message}`)
      }
    }

    // Step 2: Seed roles
    console.log('Seeding roles...')
    for (const role of seedRoles) {
      try {
        const { data: existing } = await supabase
          .from('roles')
          .select('id')
          .eq('name', role.name)
          .is('deleted_at', null)
          .single()

        if (!existing) {
          const { error } = await supabase.from('roles').insert({
            name: role.name,
            description: role.description,
            is_active: true,
          })

          if (error) {
            stats.errors.push(`Failed to create role ${role.name}: ${error.message}`)
          } else {
            stats.rolesCreated++
          }
        }
      } catch (error: any) {
        stats.errors.push(`Error seeding role ${role.name}: ${error.message}`)
      }
    }

    // Step 3: Get all departments and verticals, then create teams
    console.log('Creating teams...')
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name')
      .is('deleted_at', null)
      .eq('is_active', true)

    const { data: verticals } = await supabase
      .from('verticals')
      .select('id, name')
      .is('deleted_at', null)
      .eq('is_active', true)

    if (departments && verticals) {
      // Create teams for each department × vertical combination
      for (const dept of departments) {
        for (const vertical of verticals) {
          try {
            await getOrCreateTeam(dept.id, vertical.id)
            stats.teamsCreated++
          } catch (error: any) {
            stats.errors.push(`Failed to create team ${dept.name} × ${vertical.name}: ${error.message}`)
          }
        }

        // Also create vertical-agnostic team for each department
        try {
          await getOrCreateTeam(dept.id, null)
          stats.teamsCreated++
        } catch (error: any) {
          stats.errors.push(`Failed to create vertical-agnostic team for ${dept.name}: ${error.message}`)
        }
      }
    }

    // Step 4: Migrate existing employees
    console.log('Migrating employees...')
    const { data: employees } = await supabase
      .from('employees')
      .select(`
        id,
        profile:profiles!employees_profile_id_profiles_id_fk(
          id,
          department_id,
          position
        )
      `)
      .is('deleted_at', null)

    if (employees) {
      // Default vertical for migration (Internal Tools / SaaS)
      const defaultVerticalId = await resolveVerticalId('Internal Tools / SaaS', false)

      for (const employee of employees) {
        try {
          const profile = employee.profile as any
          if (!profile) continue

          const departmentId = profile.department_id
          const positionText = profile.position

          if (!departmentId) {
            stats.errors.push(`Employee ${employee.id} has no department_id`)
            continue
          }

          // Find or create role from position text
          let roleId: string | null = null
          if (positionText) {
            // Try to find existing role by name match
            const { data: role } = await supabase
              .from('roles')
              .select('id')
              .ilike('name', positionText)
              .is('deleted_at', null)
              .limit(1)
              .single()

            if (role) {
              roleId = role.id
            } else {
              // Create new role from position text
              const { data: newRole, error: roleError } = await supabase
                .from('roles')
                .insert({
                  name: positionText,
                  is_active: true,
                })
                .select('id')
                .single()

              if (newRole && !roleError) {
                roleId = newRole.id
                stats.rolesCreated++
              }
            }
          }

          // If no role found/created, skip this employee
          if (!roleId) {
            stats.errors.push(`Employee ${employee.id}: Could not resolve role from position "${positionText}"`)
            continue
          }

          // Get or create team (use default vertical or null)
          const teamId = await getOrCreateTeam(departmentId, defaultVerticalId)

          // Check if position already exists
          const { data: existingPosition } = await supabase
            .from('positions')
            .select('id')
            .eq('employee_id', employee.id)
            .eq('team_id', teamId)
            .eq('role_id', roleId)
            .is('deleted_at', null)
            .single()

          if (existingPosition) {
            // Position already exists, skip
            continue
          }

          // Create position
          const { data: newPosition, error: positionError } = await supabase
            .from('positions')
            .insert({
              employee_id: employee.id,
              team_id: teamId,
              role_id: roleId,
              is_primary: true, // Mark as primary for migrated employees
              is_active: true,
            })
            .select('id')
            .single()

          if (newPosition && !positionError) {
            // Update profile with primary position
            await supabase
              .from('profiles')
              .update({ primary_position_id: newPosition.id })
              .eq('id', profile.id)

            stats.employeesMigrated++
          } else {
            stats.errors.push(`Failed to create position for employee ${employee.id}: ${positionError?.message ?? 'Unknown error'}`)
          }
        } catch (error: any) {
          stats.errors.push(`Error migrating employee ${employee.id}: ${error.message}`)
        }
      }
    }

    const success = stats.errors.length === 0 || stats.employeesMigrated > 0

    return {
      success,
      message: `Migration completed. Created ${stats.verticalsCreated} verticals, ${stats.rolesCreated} roles, ${stats.teamsCreated} teams, migrated ${stats.employeesMigrated} employees.${stats.errors.length > 0 ? ` ${stats.errors.length} errors occurred.` : ''}`,
      stats,
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Migration failed: ${error.message}`,
      stats,
    }
  }
}



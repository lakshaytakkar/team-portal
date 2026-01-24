/**
 * Script to create auth accounts for all employees
 * - Replaces @company.com with suprans.in in email
 * - Sets password to "Suprans123"
 * - Creates auth users and profiles with role "executive"
 * Run with: bun scripts/create-employee-accounts.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_ROLE_KEY)
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const PASSWORD = 'Suprans123'

async function createEmployeeAccounts() {
  try {
    // Fetch all employees with their profile data
    console.log('Fetching employees from database...')
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select(`
        id,
        employee_id,
        profile_id,
        profile:profiles!profile_id(full_name, email)
      `)
      .is('deleted_at', null)

    if (employeesError) {
      throw new Error(`Failed to fetch employees: ${employeesError.message}`)
    }

    if (!employees || employees.length === 0) {
      console.log('No employees found in database')
      return
    }

    console.log(`Found ${employees.length} employees`)

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Process each employee
    for (const employee of employees) {
      // Get fullName before try block so it's available in catch
      const fullName = (employee.profile as any)?.full_name || 'Unknown'
      
      try {
        // Get email from profile
        const oldEmail = (employee.profile as any)?.email
        
        if (!oldEmail) {
          console.warn(`⚠️  Employee ${employee.employee_id} (${fullName}) has no email, skipping`)
          errorCount++
          errors.push(`Employee ${employee.employee_id}: No email address`)
          continue
        }

        // Replace @company.com with suprans.in
        const newEmail = oldEmail.replace('@company.com', '@suprans.in')
        
        if (oldEmail === newEmail) {
          console.log(`ℹ️  Employee ${employee.employee_id} (${fullName}) email already uses suprans.in: ${newEmail}`)
        }

        console.log(`\nProcessing ${fullName} (${employee.employee_id})...`)
        console.log(`  Email: ${oldEmail} → ${newEmail}`)

        // Check if employee already has a profile_id
        let userId: string | null = employee.profile_id || null
        
        // Check if auth user already exists with this email
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers?.users.find(u => u.email === newEmail)

        if (existingUser) {
          // If we found an existing user with this email, use that
          userId = existingUser.id
          console.log(`  Auth user already exists with this email, using existing user ID: ${userId}`)
          
          // Update password
          await supabase.auth.admin.updateUserById(userId, {
            password: PASSWORD,
          })
          console.log(`  Password updated`)
        } else if (userId) {
          // Employee has a profile_id but no auth user with this email
          // Check if the existing profile's email matches
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .single()
          
          if (existingProfile && existingProfile.email !== newEmail) {
            console.log(`  ⚠️  Employee has existing profile (${userId}) with different email (${existingProfile.email})`)
            console.log(`  Creating new auth user for new email...`)
            userId = null // Will create new user below
          } else {
            console.log(`  Using existing profile_id: ${userId}`)
            // Update password for existing user
            try {
              await supabase.auth.admin.updateUserById(userId, {
                password: PASSWORD,
              })
              console.log(`  Password updated`)
            } catch (error) {
              console.log(`  ⚠️  Could not update password (user might not exist in auth), will create new user`)
              userId = null
            }
          }
        }

        if (!userId) {
          // Create new auth user
          console.log(`  Creating auth user...`)
          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: newEmail,
            password: PASSWORD,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
            },
          })

          if (authError) {
            throw new Error(`Failed to create auth user: ${authError.message}`)
          }

          if (!authUser.user) {
            throw new Error('Failed to create auth user: No user returned')
          }

          userId = authUser.user.id
          console.log(`  Auth user created: ${userId}`)
        }

        // Create or update profile
        await createOrUpdateProfile(userId, newEmail, fullName, employee.id)

        // Update employee record with profile_id
        const { error: updateError } = await supabase
          .from('employees')
          .update({ 
            profile_id: userId,
          })
          .eq('id', employee.id)

        if (updateError) {
          throw new Error(`Failed to update employee record: ${updateError.message}`)
        }

        console.log(`  ✅ Account created/updated successfully`)
        successCount++
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error(`  ❌ Error processing ${fullName} (${employee.employee_id}): ${errorMsg}`)
        errorCount++
        errors.push(`Employee ${employee.employee_id} (${fullName}): ${errorMsg}`)
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total employees: ${employees.length}`)
    console.log(`✅ Successfully processed: ${successCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    
    if (errors.length > 0) {
      console.log('\nErrors:')
      errors.forEach(err => console.log(`  - ${err}`))
    }

    console.log('\n✅ Script completed!')
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

async function createOrUpdateProfile(
  userId: string,
  email: string,
  fullName: string,
  employeeId: string
) {
  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, department_id')
    .eq('id', userId)
    .single()

  // Get employee's department if available (from existing profile or employee's current profile)
  let departmentId = existingProfile?.department_id || null
  
  if (!departmentId) {
    const { data: employee } = await supabase
      .from('employees')
      .select(`
        profile:profiles!profile_id(department_id)
      `)
      .eq('id', employeeId)
      .single()
    
    departmentId = (employee?.profile as any)?.department_id || null
  }

  if (existingProfile) {
    // Update existing profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email,
        full_name: fullName,
        role: 'executive',
        department_id: departmentId,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }
    console.log(`  Profile updated`)
  } else {
    // Create new profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        role: 'executive',
        department_id: departmentId,
        is_active: true,
      })

    if (insertError) {
      throw new Error(`Failed to create profile: ${insertError.message}`)
    }
    console.log(`  Profile created`)
  }
}

createEmployeeAccounts()


/**
 * Script to create a superadmin user
 * Run with: npx tsx scripts/create-superadmin.ts
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

async function createSuperAdmin() {
  const email = 'superadmin@test.com'
  const password = 'superadmin123'
  const fullName = 'Super Admin'

  try {
    // Create auth user
    console.log('Creating auth user...')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('User already exists in auth, fetching...')
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers?.users.find(u => u.email === email)
        if (existingUser) {
          await createOrUpdateProfile(existingUser.id, email, fullName)
          console.log('✅ Superadmin profile updated')
          return
        }
      }
      throw authError
    }

    if (!authUser.user) {
      throw new Error('Failed to create auth user')
    }

    console.log('Auth user created:', authUser.user.id)

    // Create or update profile
    await createOrUpdateProfile(authUser.user.id, email, fullName)

    console.log('✅ Superadmin user created successfully!')
    console.log('Email:', email)
    console.log('Password:', password)
  } catch (error) {
    console.error('Error creating superadmin:', error)
    process.exit(1)
  }
}

async function createOrUpdateProfile(userId: string, email: string, fullName: string) {
  // Get first department ID (or create HR department if needed)
  let { data: departments } = await supabase
    .from('departments')
    .select('id')
    .eq('code', 'hr')
    .limit(1)
    .single()

  if (!departments) {
    // Create HR department if it doesn't exist
    const { data: newDept, error: deptError } = await supabase
      .from('departments')
      .insert({
        name: 'HR',
        code: 'hr',
        is_active: true,
      })
      .select('id')
      .single()

    if (deptError && !deptError.message.includes('duplicate')) {
      console.error('Error creating HR department:', deptError)
    } else if (newDept) {
      departments = { id: newDept.id }
    }
  }

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (existingProfile) {
    // Update existing profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email,
        full_name: fullName,
        role: 'superadmin',
        department_id: departments?.id || null,
        is_active: true,
      })
      .eq('id', userId)

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }
    console.log('Profile updated')
  } else {
    // Create new profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        role: 'superadmin',
        department_id: departments?.id || null,
        is_active: true,
      })

    if (insertError) {
      throw new Error(`Failed to create profile: ${insertError.message}`)
    }
    console.log('Profile created')
  }
}

createSuperAdmin()


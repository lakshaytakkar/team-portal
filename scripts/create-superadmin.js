/**
 * Script to create a superadmin user
 * Run with: node scripts/create-superadmin.js
 * 
 * Requires: SUPABASE_SERVICE_ROLE_KEY in environment or .env.local
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local if it exists
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8')
  envFile.split(/\r?\n/).forEach(line => {
    // Skip comments and empty lines
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return
    }
    
    // Match key=value (handles quoted and unquoted values, handles values with = in them)
    const equalIndex = trimmedLine.indexOf('=')
    if (equalIndex === -1) return
    
    const key = trimmedLine.substring(0, equalIndex).trim()
    let value = trimmedLine.substring(equalIndex + 1).trim()
    
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    
    if (key && value) {
      process.env[key] = value
    }
  })
  
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗')
  console.error('\nPlease add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
  console.error('You can find it in: Supabase Dashboard → Settings → API → service_role key')
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
    console.log('🔄 Creating superadmin user...')

    // Check if user already exists in auth
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`)
    }

    const existingUser = existingUsers?.users.find(u => u.email === email)
    let userId

    if (existingUser) {
      console.log('⚠️  User already exists in auth, updating...')
      userId = existingUser.id

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: password,
        email_confirm: true,
      })
      if (updateError) {
        console.warn('⚠️  Could not update password:', updateError.message)
      } else {
        console.log('✅ Password updated')
      }
    } else {
      // Create auth user
      console.log('📝 Creating auth user...')
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
        },
      })

      if (authError) {
        throw authError
      }

      if (!authUser.user) {
        throw new Error('Failed to create auth user')
      }

      userId = authUser.user.id
      console.log('✅ Auth user created:', userId)
    }

    // Get HR department ID
    let { data: departments } = await supabase
      .from('departments')
      .select('id')
      .eq('code', 'HR')
      .limit(1)
      .single()

    if (!departments) {
      console.log('📝 Creating HR department...')
      const { data: newDept, error: deptError } = await supabase
        .from('departments')
        .insert({
          name: 'HR',
          code: 'HR',
          is_active: true,
        })
        .select('id')
        .single()

      if (deptError && !deptError.message.includes('duplicate')) {
        console.warn('⚠️  Could not create HR department:', deptError.message)
      } else if (newDept) {
        departments = { id: newDept.id }
        console.log('✅ HR department created')
      }
    }

    const departmentId = departments?.id || null

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      // Update existing profile
      console.log('📝 Updating existing profile...')
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email,
          full_name: fullName,
          role: 'superadmin',
          department_id: departmentId,
          is_active: true,
        })
        .eq('id', userId)

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`)
      }
      console.log('✅ Profile updated')
    } else {
      // Create new profile
      console.log('📝 Creating profile...')
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: fullName,
          role: 'superadmin',
          department_id: departmentId,
          is_active: true,
        })

      if (insertError) {
        throw new Error(`Failed to create profile: ${insertError.message}`)
      }
      console.log('✅ Profile created')
    }

    console.log('\n🎉 Superadmin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:    ' + email)
    console.log('🔑 Password: ' + password)
    console.log('👤 Role:     superadmin')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\nYou can now log in at: http://localhost:3000/sign-in')
  } catch (error) {
    console.error('\n❌ Error creating superadmin:', error.message)
    if (error.stack) {
      console.error('\nStack trace:', error.stack)
    }
    process.exit(1)
  }
}

createSuperAdmin()


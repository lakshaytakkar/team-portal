/**
 * Apply evaluation rounds migration
 * Run with: bun scripts/apply-evaluation-rounds-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const envContent = readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    })
  } catch (e) {
    console.error('Could not load .env.local file')
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  console.log('🔄 Applying evaluation rounds migration...\n')

  try {
    // Check if evaluation_round column already exists
    const { data: columns } = await supabase.rpc('get_table_columns', { table_name: 'evaluations' }).single()

    // Try to add columns - they may already exist
    const alterStatements = [
      `ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS evaluation_round TEXT DEFAULT 'level_1' CHECK (evaluation_round IN ('level_1', 'level_2'))`,
      `ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS evaluator_title TEXT`,
      `ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS department_fit_score INTEGER CHECK (department_fit_score >= 1 AND department_fit_score <= 10)`,
      `ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS leadership_score INTEGER CHECK (leadership_score >= 1 AND leadership_score <= 10)`,
      `ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS is_final_decision BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS final_status TEXT CHECK (final_status IN ('selected', 'rejected', 'on_hold', 'pending'))`,
    ]

    // We can't run raw SQL via the JS client, so we'll update existing records instead
    // First, let's update existing evaluations to have level_1 as default

    // Check if columns exist by trying to select them
    const { data: testData, error: testError } = await supabase
      .from('evaluations')
      .select('id, evaluation_round')
      .limit(1)

    if (testError && testError.message.includes('evaluation_round')) {
      console.log('❌ Column evaluation_round does not exist. Please run the SQL migration manually:')
      console.log('\nRun this SQL in the Supabase Dashboard SQL Editor:\n')
      console.log(`
ALTER TABLE evaluations
ADD COLUMN IF NOT EXISTS evaluation_round TEXT DEFAULT 'level_1' CHECK (evaluation_round IN ('level_1', 'level_2')),
ADD COLUMN IF NOT EXISTS evaluator_title TEXT,
ADD COLUMN IF NOT EXISTS department_fit_score INTEGER CHECK (department_fit_score >= 1 AND department_fit_score <= 10),
ADD COLUMN IF NOT EXISTS leadership_score INTEGER CHECK (leadership_score >= 1 AND leadership_score <= 10),
ADD COLUMN IF NOT EXISTS is_final_decision BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS final_status TEXT CHECK (final_status IN ('selected', 'rejected', 'on_hold', 'pending'));
      `)
      return
    }

    console.log('✓ Columns already exist or migration applied')

    // Update existing evaluations to be level_1 if not set
    const { error: updateError } = await supabase
      .from('evaluations')
      .update({ evaluation_round: 'level_1' })
      .is('evaluation_round', null)

    if (updateError) {
      console.log('Note: Could not update null evaluation_rounds:', updateError.message)
    } else {
      console.log('✓ Updated existing evaluations to level_1')
    }

    console.log('\n✅ Migration check complete!')

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
  }
}

applyMigration()

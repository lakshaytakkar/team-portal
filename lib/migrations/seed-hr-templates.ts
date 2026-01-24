/**
 * Seed script for HR templates
 * Inserts sample template data into the hr_templates table
 * 
 * Run this script once after creating the database tables.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { seedHRTemplates } from '@/lib/data/seed-hr-templates'

interface SeedResult {
  success: boolean
  message: string
  stats: {
    templatesCreated: number
    templatesSkipped: number
    errors: string[]
  }
}

export async function seedHRTemplatesData(): Promise<SeedResult> {
  const supabase = await createClient()
  const stats = {
    templatesCreated: 0,
    templatesSkipped: 0,
    errors: [] as string[],
  }

  try {
    // Get current user for created_by
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check if templates already exist
    const { data: existingTemplates, error: checkError } = await supabase
      .from('hr_templates')
      .select('name, type')
      .is('deleted_at', null)
      .limit(1)

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "relation does not exist" - table hasn't been created yet
      throw new Error(`Failed to check existing templates: ${checkError.message}`)
    }

    // If templates exist, skip seeding
    if (existingTemplates && existingTemplates.length > 0) {
      return {
        success: true,
        message: 'Templates already exist. Skipping seed.',
        stats: {
          templatesCreated: 0,
          templatesSkipped: seedHRTemplates.length,
          errors: [],
        },
      }
    }

    // Insert seed templates
    console.log('Seeding HR templates...')
    for (const template of seedHRTemplates) {
      try {
        const { error } = await supabase.from('hr_templates').insert({
          name: template.name,
          type: template.type,
          category: template.category,
          description: template.description,
          content: template.content,
          variables: template.variables ? JSON.stringify(template.variables) : null,
          is_active: template.isActive,
          created_by: user.id,
          updated_by: user.id,
        })

        if (error) {
          stats.errors.push(`Failed to create template ${template.name}: ${error.message}`)
        } else {
          stats.templatesCreated++
        }
      } catch (error: any) {
        stats.errors.push(`Error seeding template ${template.name}: ${error.message}`)
      }
    }

    const success = stats.errors.length === 0
    return {
      success,
      message: success
        ? `Successfully seeded ${stats.templatesCreated} HR templates`
        : `Seeded ${stats.templatesCreated} templates with ${stats.errors.length} errors`,
      stats,
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to seed HR templates: ${error.message}`,
      stats: {
        templatesCreated: stats.templatesCreated,
        templatesSkipped: stats.templatesSkipped,
        errors: [...stats.errors, error.message],
      },
    }
  }
}


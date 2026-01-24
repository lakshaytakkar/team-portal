/**
 * Seed script for job portals, credentials, and evaluations
 * Run with: bun scripts/seed-job-portals.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables from .env.local
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

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedJobPortalsAndCredentials() {
  console.log('\n📦 Seeding Job Portals and Credentials...\n')
  const results: string[] = []

  try {
    // ========================================================================
    // 1. CREATE CREDENTIAL CATEGORY FOR JOB PORTALS
    // ========================================================================

    const { data: existingCategory } = await supabase
      .from('credential_categories')
      .select('id')
      .eq('name', 'Job Portals')
      .single()

    let categoryId: string

    if (existingCategory) {
      categoryId = existingCategory.id
      console.log('✓ Job Portals category already exists')
    } else {
      const { data: category, error: catError } = await supabase
        .from('credential_categories')
        .insert({
          name: 'Job Portals',
          description: 'Login credentials for various job posting platforms',
          icon: 'Briefcase',
          color: 'blue',
          sort_order: 10,
          is_active: true,
        })
        .select()
        .single()

      if (catError) throw new Error(`Failed to create category: ${catError.message}`)
      categoryId = category.id
      console.log('✓ Created Job Portals category')
    }

    // ========================================================================
    // 2. JOB PORTAL DATA
    // ========================================================================

    const jobPortalsData = [
      {
        name: 'Internshala',
        url: 'https://internshala.com',
        loginUrl: 'https://internshala.com/login/employer',
        description: 'India\'s leading internship and fresher job platform',
        username: 'hr@techvision.com',
        email: 'hr@techvision.com',
        password: 'Intern$hala2024!',
        notes: 'Premium employer account. Used for internship postings and fresher hiring.',
      },
      {
        name: 'WorkIndia',
        url: 'https://www.workindia.in',
        loginUrl: 'https://employer.workindia.in/login',
        description: 'Blue-collar and entry-level job platform in India',
        username: 'techvision_hr',
        email: 'recruitment@techvision.com',
        password: 'W0rkInd!a@2024',
        notes: 'Used for hiring support staff, field executives, and delivery personnel.',
      },
      {
        name: 'Naukri.com',
        url: 'https://www.naukri.com',
        loginUrl: 'https://www.naukri.com/nlogin/login',
        description: 'India\'s largest job portal for professionals',
        username: 'techvision.recruiter',
        email: 'careers@techvision.com',
        password: 'N@ukri#Secure2024',
        apiKey: 'nk_api_8f7d6e5c4b3a2190',
        notes: 'Premium Resdex subscription active. API access enabled for job posting automation.',
      },
      {
        name: 'LinkedIn Recruiter',
        url: 'https://www.linkedin.com/talent',
        loginUrl: 'https://www.linkedin.com/talent/login',
        description: 'Professional networking and recruitment platform',
        username: 'hr@techvision.com',
        email: 'hr@techvision.com',
        password: 'L!nked1n@Recruit2024',
        notes: 'Recruiter Lite subscription. 30 InMail credits per month.',
      },
      {
        name: 'Indeed',
        url: 'https://www.indeed.com',
        loginUrl: 'https://employers.indeed.com/auth/signin',
        description: 'Global job search engine and posting platform',
        username: 'techvision.careers',
        email: 'careers@techvision.com',
        password: 'Ind33d$ecure2024!',
        notes: 'Sponsored job posting credits available. Analytics dashboard enabled.',
      },
      {
        name: 'Shine.com',
        url: 'https://www.shine.com',
        loginUrl: 'https://www.shine.com/employer/login/',
        description: 'Job portal by HT Media for Indian professionals',
        username: 'techvision_talent',
        email: 'talent@techvision.com',
        password: 'Sh!ne@Jobs2024',
        notes: 'Standard employer account. Resume database access included.',
      },
      {
        name: 'Monster India',
        url: 'https://www.monsterindia.com',
        loginUrl: 'https://www.monsterindia.com/employer/login',
        description: 'Part of Monster Worldwide job platform network',
        username: 'techvision.hr',
        email: 'hr@techvision.com',
        password: 'M0nster!India2024',
        notes: 'Job wrapping service enabled. Auto-posting to multiple sites.',
      },
      {
        name: 'Glassdoor',
        url: 'https://www.glassdoor.com',
        loginUrl: 'https://www.glassdoor.com/employers/sign-in/',
        description: 'Company reviews and job listings platform',
        username: 'admin@techvision.com',
        email: 'admin@techvision.com',
        password: 'Gl@ssd00r2024!',
        notes: 'Employer branding profile active. Respond to reviews monthly.',
      },
      {
        name: 'AngelList / Wellfound',
        url: 'https://wellfound.com',
        loginUrl: 'https://wellfound.com/login',
        description: 'Startup-focused job platform (formerly AngelList Talent)',
        username: 'founder@techvision.com',
        email: 'founder@techvision.com',
        password: 'W3llf0und!2024',
        notes: 'Startup profile verified. Used for tech and product roles.',
      },
      {
        name: 'Apna',
        url: 'https://apna.co',
        loginUrl: 'https://employer.apna.co/login',
        description: 'Hyperlocal job platform for grey and blue-collar workers',
        username: 'techvision.recruiter',
        email: 'jobs@techvision.com',
        password: 'Apna@J0bs2024',
        notes: 'Verification completed. Chat-based hiring enabled.',
      },
    ]

    // ========================================================================
    // 3. CREATE CREDENTIALS AND JOB PORTALS
    // ========================================================================

    for (const portal of jobPortalsData) {
      // Check if credential already exists
      const { data: existingCred } = await supabase
        .from('credentials')
        .select('id')
        .eq('name', portal.name)
        .eq('category_id', categoryId)
        .is('deleted_at', null)
        .single()

      let credentialId: string

      if (existingCred) {
        credentialId = existingCred.id
        console.log(`✓ Credential "${portal.name}" already exists`)
      } else {
        const { data: credential, error: credError } = await supabase
          .from('credentials')
          .insert({
            category_id: categoryId,
            name: portal.name,
            description: portal.description,
            credential_type: portal.apiKey ? 'api_key' : 'login',
            username: portal.username,
            password: portal.password,
            email: portal.email,
            api_key: portal.apiKey || null,
            url: portal.loginUrl || portal.url,
            access_level: 'hr_team',
            is_active: true,
            notes: portal.notes,
          })
          .select()
          .single()

        if (credError) {
          console.log(`✗ Failed to create credential "${portal.name}": ${credError.message}`)
          continue
        }
        credentialId = credential.id
        console.log(`✓ Created credential "${portal.name}"`)
      }

      // Check if job portal already exists
      const { data: existingPortal } = await supabase
        .from('job_portals')
        .select('id')
        .eq('name', portal.name)
        .single()

      let portalId: string

      if (existingPortal) {
        portalId = existingPortal.id
        console.log(`✓ Job portal "${portal.name}" already exists`)
      } else {
        const { data: jobPortal, error: portalError } = await supabase
          .from('job_portals')
          .insert({
            name: portal.name,
            url: portal.url,
            status: 'active',
            api_key: portal.apiKey || null,
            notes: portal.description,
          })
          .select()
          .single()

        if (portalError) {
          console.log(`✗ Failed to create job portal "${portal.name}": ${portalError.message}`)
          continue
        }
        portalId = jobPortal.id
        console.log(`✓ Created job portal "${portal.name}"`)
      }

      // Link credential to job portal
      const { data: existingLink } = await supabase
        .from('job_portal_credentials')
        .select('id')
        .eq('job_portal_id', portalId)
        .eq('credential_id', credentialId)
        .single()

      if (!existingLink) {
        const { error: linkError } = await supabase
          .from('job_portal_credentials')
          .insert({
            job_portal_id: portalId,
            credential_id: credentialId,
            is_primary: true,
            notes: `Primary login for ${portal.name}`,
          })

        if (linkError) {
          console.log(`✗ Failed to link credential to portal "${portal.name}": ${linkError.message}`)
        } else {
          console.log(`✓ Linked credential to job portal "${portal.name}"`)
        }
      } else {
        console.log(`✓ Credential already linked to "${portal.name}"`)
      }
    }

    console.log('\n✅ Job portals and credentials seeded successfully!\n')
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

async function seedEvaluations() {
  console.log('\n📝 Seeding Evaluations...\n')

  try {
    // Get completed interviews without evaluations
    const { data: interviews, error: intError } = await supabase
      .from('interviews')
      .select(`
        id,
        interviewer_id,
        application:applications(
          id,
          candidate:candidates(full_name)
        )
      `)
      .eq('status', 'completed')

    if (intError) throw new Error(`Failed to fetch interviews: ${intError.message}`)

    if (!interviews || interviews.length === 0) {
      console.log('No completed interviews found to evaluate')
      return
    }

    // Check which interviews already have evaluations
    const { data: existingEvals } = await supabase
      .from('evaluations')
      .select('interview_id')

    const evaluatedInterviewIds = new Set((existingEvals || []).map(e => e.interview_id))

    const evaluationTemplates = [
      {
        technicalScore: 8,
        communicationScore: 9,
        culturalFitScore: 8,
        overallScore: 8,
        strengths: 'Strong problem-solving skills. Excellent communication and team collaboration.',
        weaknesses: 'Could improve on system design concepts.',
        feedback: 'Candidate demonstrated excellent technical skills and a positive attitude. Showed great enthusiasm for the role and company culture.',
        recommendation: 'hire',
      },
      {
        technicalScore: 7,
        communicationScore: 8,
        culturalFitScore: 9,
        overallScore: 8,
        strengths: 'Great cultural fit. Strong interpersonal skills and leadership potential.',
        weaknesses: 'Technical depth could be improved in some areas.',
        feedback: 'Would be a great addition to the team. Demonstrates potential for growth and learning.',
        recommendation: 'hire',
      },
      {
        technicalScore: 6,
        communicationScore: 7,
        culturalFitScore: 7,
        overallScore: 7,
        strengths: 'Good foundational knowledge. Eager to learn.',
        weaknesses: 'Needs more hands-on experience. Some gaps in core concepts.',
        feedback: 'Candidate shows promise but may need additional mentoring. Consider for junior role.',
        recommendation: 'maybe',
      },
      {
        technicalScore: 9,
        communicationScore: 7,
        culturalFitScore: 8,
        overallScore: 8,
        strengths: 'Exceptional technical skills. Deep understanding of algorithms and data structures.',
        weaknesses: 'Communication could be more structured. Tends to dive into technical details.',
        feedback: 'Strong technical candidate. Would excel in individual contributor role.',
        recommendation: 'hire',
      },
      {
        technicalScore: 5,
        communicationScore: 6,
        culturalFitScore: 6,
        overallScore: 6,
        strengths: 'Positive attitude and willingness to learn.',
        weaknesses: 'Significant gaps in required technical skills. Limited experience with our tech stack.',
        feedback: 'Does not meet the technical requirements for this role at this time.',
        recommendation: 'no-hire',
      },
    ]

    let created = 0
    for (const interview of interviews) {
      if (evaluatedInterviewIds.has(interview.id)) {
        continue
      }

      const template = evaluationTemplates[created % evaluationTemplates.length]
      const candidateName = (interview.application as any)?.candidate?.full_name || 'Unknown'

      const { error: evalError } = await supabase
        .from('evaluations')
        .insert({
          interview_id: interview.id,
          evaluated_by_id: interview.interviewer_id,
          technical_score: template.technicalScore,
          communication_score: template.communicationScore,
          cultural_fit_score: template.culturalFitScore,
          overall_score: template.overallScore,
          strengths: template.strengths,
          weaknesses: template.weaknesses,
          feedback: template.feedback,
          recommendation: template.recommendation,
          evaluated_at: new Date().toISOString(),
        })

      if (evalError) {
        console.log(`✗ Failed to create evaluation for ${candidateName}: ${evalError.message}`)
      } else {
        console.log(`✓ Created evaluation for ${candidateName}`)
        created++
      }

      if (created >= 10) break
    }

    if (created === 0) {
      console.log('All completed interviews already have evaluations')
    } else {
      console.log(`\n✅ Created ${created} evaluations!\n`)
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
  }
}

async function main() {
  console.log('🚀 Starting seed process...')
  await seedJobPortalsAndCredentials()
  await seedEvaluations()
  console.log('🎉 Seed process completed!')
}

main()

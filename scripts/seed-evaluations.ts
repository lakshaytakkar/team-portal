/**
 * Seed script for sample evaluations data
 * Run with: bun scripts/seed-evaluations.ts
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

async function seedEvaluations() {
  console.log('\n📝 Seeding Sample Evaluations Data...\n')

  try {
    // Get a department ID
    const { data: dept } = await supabase
      .from('departments')
      .select('id')
      .limit(1)
      .single()

    if (!dept) {
      console.log('Creating a default department...')
      const { data: newDept, error: deptErr } = await supabase
        .from('departments')
        .insert({ name: 'Engineering', code: 'ENG' })
        .select()
        .single()
      if (deptErr) throw new Error(`Failed to create department: ${deptErr.message}`)
    }

    const departmentId = dept?.id || (await supabase.from('departments').select('id').limit(1).single()).data?.id

    // Get any profile for interviewer (prefer admin, then manager, then any)
    let { data: userProfile } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('role', 'admin')
      .limit(1)
      .single()

    if (!userProfile) {
      const { data: managerProfile } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'manager')
        .limit(1)
        .single()
      userProfile = managerProfile
    }

    if (!userProfile) {
      const { data: anyProfile } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .limit(1)
        .single()
      userProfile = anyProfile
    }

    if (!userProfile) {
      console.log('❌ No user profile found. Please create a user first.')
      return
    }

    console.log(`✓ Using profile: ${userProfile.full_name || userProfile.id} (${userProfile.role})`)

    // Create job postings if they don't exist
    const jobPostings = [
      { title: 'Senior Software Engineer', location: 'Bangalore, India', employment_type: 'full-time', role_type: 'internal' },
      { title: 'Product Manager', location: 'Mumbai, India', employment_type: 'full-time', role_type: 'internal' },
      { title: 'UX Designer', location: 'Remote', employment_type: 'full-time', role_type: 'internal' },
    ]

    const jobPostingIds: Record<string, string> = {}

    for (const jp of jobPostings) {
      const { data: existing } = await supabase
        .from('job_postings')
        .select('id')
        .eq('title', jp.title)
        .single()

      if (existing) {
        jobPostingIds[jp.title] = existing.id
        console.log(`✓ Job posting "${jp.title}" already exists`)
      } else {
        const { data: newJp, error: jpErr } = await supabase
          .from('job_postings')
          .insert({
            ...jp,
            department_id: departmentId,
            status: 'published',
            description: `Looking for talented ${jp.title} to join our team.`,
            posted_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single()

        if (jpErr) {
          console.log(`✗ Failed to create job posting "${jp.title}": ${jpErr.message}`)
          continue
        }
        jobPostingIds[jp.title] = newJp.id
        console.log(`✓ Created job posting "${jp.title}"`)
      }
    }

    // Create candidates
    const candidates = [
      { full_name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '+91-9876543210', status: 'interview', source: 'linkedin', skills: 'React, Node.js, TypeScript, AWS', experience: '5 years at Tech Corp as Senior Developer', education: 'B.Tech in Computer Science, IIT Delhi' },
      { full_name: 'Priya Patel', email: 'priya.patel@email.com', phone: '+91-9876543211', status: 'interview', source: 'naukri', skills: 'Product Strategy, Agile, Data Analysis', experience: '4 years as Product Manager at StartupXYZ', education: 'MBA, IIM Ahmedabad' },
      { full_name: 'Amit Kumar', email: 'amit.kumar@email.com', phone: '+91-9876543212', status: 'interview', source: 'referral', skills: 'Python, Machine Learning, TensorFlow', experience: '3 years as ML Engineer', education: 'M.Tech in AI, IISC Bangalore' },
      { full_name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '+91-9876543214', status: 'offer', source: 'job-board', skills: 'Java, Spring Boot, Microservices', experience: '6 years as Backend Developer', education: 'B.Tech, BITS Pilani' },
    ]

    const candidateIds: Record<string, string> = {}

    for (const cand of candidates) {
      const { data: existing } = await supabase
        .from('candidates')
        .select('id')
        .eq('email', cand.email)
        .single()

      if (existing) {
        candidateIds[cand.email] = existing.id
        console.log(`✓ Candidate "${cand.full_name}" already exists`)
      } else {
        const { data: newCand, error: candErr } = await supabase
          .from('candidates')
          .insert(cand)
          .select()
          .single()

        if (candErr) {
          console.log(`✗ Failed to create candidate "${cand.full_name}": ${candErr.message}`)
          continue
        }
        candidateIds[cand.email] = newCand.id
        console.log(`✓ Created candidate "${cand.full_name}"`)
      }
    }

    // Create applications
    const applications = [
      { candidateEmail: 'rahul.sharma@email.com', jobTitle: 'Senior Software Engineer', status: 'interview', source: 'linkedin' },
      { candidateEmail: 'priya.patel@email.com', jobTitle: 'Product Manager', status: 'interview', source: 'naukri' },
      { candidateEmail: 'amit.kumar@email.com', jobTitle: 'Senior Software Engineer', status: 'interview', source: 'referral' },
      { candidateEmail: 'vikram.singh@email.com', jobTitle: 'Senior Software Engineer', status: 'offer', source: 'job-board' },
    ]

    const applicationIds: Record<string, string> = {}

    for (const app of applications) {
      const candidateId = candidateIds[app.candidateEmail]
      const jobPostingId = jobPostingIds[app.jobTitle]

      if (!candidateId || !jobPostingId) {
        console.log(`✗ Missing candidate or job posting for application`)
        continue
      }

      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('candidate_id', candidateId)
        .eq('job_posting_id', jobPostingId)
        .single()

      if (existing) {
        applicationIds[app.candidateEmail] = existing.id
        console.log(`✓ Application for "${app.candidateEmail}" already exists`)
      } else {
        const { data: newApp, error: appErr } = await supabase
          .from('applications')
          .insert({
            candidate_id: candidateId,
            job_posting_id: jobPostingId,
            status: app.status,
            source: app.source,
            applied_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single()

        if (appErr) {
          console.log(`✗ Failed to create application for "${app.candidateEmail}": ${appErr.message}`)
          continue
        }
        applicationIds[app.candidateEmail] = newApp.id
        console.log(`✓ Created application for "${app.candidateEmail}"`)
      }
    }

    // Create completed interviews
    const interviews = [
      { candidateEmail: 'rahul.sharma@email.com', daysAgo: 5, time: '10:00', type: 'video', location: 'Google Meet', notes: 'Technical interview focusing on system design and coding skills.' },
      { candidateEmail: 'priya.patel@email.com', daysAgo: 4, time: '14:00', type: 'video', location: 'Zoom', notes: 'Product sense and case study interview.' },
      { candidateEmail: 'amit.kumar@email.com', daysAgo: 3, time: '11:00', type: 'video', location: 'Google Meet', notes: 'ML concepts and practical coding assessment.' },
      { candidateEmail: 'vikram.singh@email.com', daysAgo: 10, time: '15:00', type: 'in-person', location: 'Office - Conference Room A', notes: 'Final round - system design and architecture discussion.' },
    ]

    const interviewIds: Record<string, string> = {}

    for (const int of interviews) {
      const applicationId = applicationIds[int.candidateEmail]

      if (!applicationId) {
        console.log(`✗ Missing application for interview`)
        continue
      }

      const { data: existing } = await supabase
        .from('interviews')
        .select('id')
        .eq('application_id', applicationId)
        .single()

      if (existing) {
        interviewIds[int.candidateEmail] = existing.id
        console.log(`✓ Interview for "${int.candidateEmail}" already exists`)
      } else {
        const interviewDate = new Date(Date.now() - int.daysAgo * 24 * 60 * 60 * 1000)
        const { data: newInt, error: intErr } = await supabase
          .from('interviews')
          .insert({
            application_id: applicationId,
            interviewer_id: userProfile.id,
            interview_date: interviewDate.toISOString().split('T')[0],
            interview_time: int.time,
            interview_type: int.type,
            status: 'completed',
            location: int.location,
            notes: int.notes,
          })
          .select()
          .single()

        if (intErr) {
          console.log(`✗ Failed to create interview for "${int.candidateEmail}": ${intErr.message}`)
          continue
        }
        interviewIds[int.candidateEmail] = newInt.id
        console.log(`✓ Created completed interview for "${int.candidateEmail}"`)
      }
    }

    // Create Level 1 evaluations (Department Senior)
    const level1Evaluations = [
      {
        candidateEmail: 'rahul.sharma@email.com',
        technicalScore: 8,
        communicationScore: 9,
        culturalFitScore: 8,
        overallScore: 8,
        departmentFitScore: 9,
        leadershipScore: 7,
        strengths: 'Strong problem-solving skills. Excellent knowledge of React and Node.js ecosystem. Good system design thinking.',
        weaknesses: 'Could improve on database optimization concepts. Limited experience with Kubernetes.',
        feedback: 'Rahul demonstrated excellent technical skills and a positive attitude. He solved the coding challenge efficiently and explained his approach clearly. Would be a strong addition to the engineering team.',
        recommendation: 'hire',
        evaluatorTitle: 'Senior Software Engineer',
        daysAgo: 4,
      },
      {
        candidateEmail: 'priya.patel@email.com',
        technicalScore: 7,
        communicationScore: 9,
        culturalFitScore: 9,
        overallScore: 8,
        departmentFitScore: 8,
        leadershipScore: 9,
        strengths: 'Excellent communication and stakeholder management skills. Strong product sense. Data-driven decision making.',
        weaknesses: 'Could benefit from more technical depth. Limited experience with B2B products.',
        feedback: 'Priya showed exceptional product thinking and clearly articulated her approach to product development. Her case study solution was well-structured and user-focused.',
        recommendation: 'hire',
        evaluatorTitle: 'Senior Product Manager',
        daysAgo: 3,
      },
      {
        candidateEmail: 'amit.kumar@email.com',
        technicalScore: 6,
        communicationScore: 7,
        culturalFitScore: 7,
        overallScore: 7,
        departmentFitScore: 6,
        leadershipScore: 5,
        strengths: 'Good foundational ML knowledge. Eager to learn and grow. Positive attitude.',
        weaknesses: 'Needs more hands-on experience with production ML systems. Some gaps in deep learning concepts.',
        feedback: 'Amit shows promise but may need additional mentoring. Consider for a junior ML role with growth path to senior position.',
        recommendation: 'maybe',
        evaluatorTitle: 'ML Team Lead',
        daysAgo: 2,
      },
      {
        candidateEmail: 'vikram.singh@email.com',
        technicalScore: 9,
        communicationScore: 8,
        culturalFitScore: 9,
        overallScore: 9,
        departmentFitScore: 9,
        leadershipScore: 8,
        strengths: 'Exceptional technical skills. Deep understanding of distributed systems. Strong leadership qualities.',
        weaknesses: 'Can be overly detail-oriented. May need to delegate more effectively.',
        feedback: 'Vikram is an outstanding candidate with proven experience in building scalable systems. Highly recommend for the senior position.',
        recommendation: 'hire',
        evaluatorTitle: 'Engineering Manager',
        daysAgo: 9,
      },
    ]

    // Create Level 2 evaluations (Final Decision) for candidates who passed Level 1
    const level2Evaluations = [
      {
        candidateEmail: 'rahul.sharma@email.com',
        technicalScore: 8,
        communicationScore: 9,
        culturalFitScore: 9,
        overallScore: 9,
        departmentFitScore: 9,
        leadershipScore: 8,
        strengths: 'Excellent cultural fit. Strong technical foundation. Great team player.',
        weaknesses: 'None significant.',
        feedback: 'After thorough evaluation, Rahul is approved for hire. Offer to be extended for Senior Software Engineer position.',
        recommendation: 'hire',
        evaluatorTitle: 'HR Manager',
        finalStatus: 'selected',
        daysAgo: 2,
      },
      {
        candidateEmail: 'priya.patel@email.com',
        technicalScore: 8,
        communicationScore: 10,
        culturalFitScore: 9,
        overallScore: 9,
        departmentFitScore: 9,
        leadershipScore: 9,
        strengths: 'Outstanding communication. Perfect culture fit. Strong leadership potential.',
        weaknesses: 'None.',
        feedback: 'Priya is an excellent candidate. Approved for hire as Product Manager.',
        recommendation: 'hire',
        evaluatorTitle: 'VP of Product',
        finalStatus: 'selected',
        daysAgo: 1,
      },
      {
        candidateEmail: 'vikram.singh@email.com',
        technicalScore: 9,
        communicationScore: 9,
        culturalFitScore: 9,
        overallScore: 9,
        departmentFitScore: 10,
        leadershipScore: 9,
        strengths: 'Top-tier candidate. Exceptional across all dimensions.',
        weaknesses: 'May need adjustment to collaborative culture (used to working independently).',
        feedback: 'Vikram is approved for hire. Fast-track onboarding recommended. Offer already extended and accepted.',
        recommendation: 'hire',
        evaluatorTitle: 'CTO',
        finalStatus: 'selected',
        daysAgo: 7,
      },
    ]

    let evaluationsCreated = 0

    // Insert Level 1 evaluations
    console.log('\n--- Level 1 Evaluations (Department Senior) ---')
    for (const evalData of level1Evaluations) {
      const interviewId = interviewIds[evalData.candidateEmail]

      if (!interviewId) {
        console.log(`✗ Missing interview for evaluation`)
        continue
      }

      const { data: existing } = await supabase
        .from('evaluations')
        .select('id')
        .eq('interview_id', interviewId)
        .eq('evaluation_round', 'level_1')
        .single()

      if (existing) {
        console.log(`✓ L1 Evaluation for "${evalData.candidateEmail}" already exists`)
        evaluationsCreated++
      } else {
        const evaluatedAt = new Date(Date.now() - evalData.daysAgo * 24 * 60 * 60 * 1000)
        const { error: evalErr } = await supabase
          .from('evaluations')
          .insert({
            interview_id: interviewId,
            evaluated_by_id: userProfile.id,
            technical_score: evalData.technicalScore,
            communication_score: evalData.communicationScore,
            cultural_fit_score: evalData.culturalFitScore,
            overall_score: evalData.overallScore,
            department_fit_score: evalData.departmentFitScore,
            leadership_score: evalData.leadershipScore,
            strengths: evalData.strengths,
            weaknesses: evalData.weaknesses,
            feedback: evalData.feedback,
            recommendation: evalData.recommendation,
            evaluation_round: 'level_1',
            evaluator_title: evalData.evaluatorTitle,
            is_final_decision: false,
            evaluated_at: evaluatedAt.toISOString(),
          })

        if (evalErr) {
          console.log(`✗ Failed to create L1 evaluation for "${evalData.candidateEmail}": ${evalErr.message}`)
        } else {
          console.log(`✓ Created L1 evaluation for "${evalData.candidateEmail}" (${evalData.evaluatorTitle})`)
          evaluationsCreated++
        }
      }
    }

    // Insert Level 2 evaluations
    console.log('\n--- Level 2 Evaluations (Final Decision) ---')
    for (const evalData of level2Evaluations) {
      const interviewId = interviewIds[evalData.candidateEmail]

      if (!interviewId) {
        console.log(`✗ Missing interview for L2 evaluation`)
        continue
      }

      const { data: existing } = await supabase
        .from('evaluations')
        .select('id')
        .eq('interview_id', interviewId)
        .eq('evaluation_round', 'level_2')
        .single()

      if (existing) {
        console.log(`✓ L2 Evaluation for "${evalData.candidateEmail}" already exists`)
        evaluationsCreated++
      } else {
        const evaluatedAt = new Date(Date.now() - evalData.daysAgo * 24 * 60 * 60 * 1000)
        const { error: evalErr } = await supabase
          .from('evaluations')
          .insert({
            interview_id: interviewId,
            evaluated_by_id: userProfile.id,
            technical_score: evalData.technicalScore,
            communication_score: evalData.communicationScore,
            cultural_fit_score: evalData.culturalFitScore,
            overall_score: evalData.overallScore,
            department_fit_score: evalData.departmentFitScore,
            leadership_score: evalData.leadershipScore,
            strengths: evalData.strengths,
            weaknesses: evalData.weaknesses,
            feedback: evalData.feedback,
            recommendation: evalData.recommendation,
            evaluation_round: 'level_2',
            evaluator_title: evalData.evaluatorTitle,
            is_final_decision: true,
            final_status: evalData.finalStatus,
            evaluated_at: evaluatedAt.toISOString(),
          })

        if (evalErr) {
          console.log(`✗ Failed to create L2 evaluation for "${evalData.candidateEmail}": ${evalErr.message}`)
        } else {
          console.log(`✓ Created L2 evaluation for "${evalData.candidateEmail}" (${evalData.evaluatorTitle}) - ${evalData.finalStatus}`)
          evaluationsCreated++
        }
      }
    }

    console.log(`\n✅ Created/verified ${evaluationsCreated} evaluations (L1 + L2)!\n`)
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
  }
}

async function main() {
  console.log('🚀 Starting evaluations seed process...')
  await seedEvaluations()
  console.log('🎉 Seed process completed!')
}

main()

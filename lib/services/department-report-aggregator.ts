'use server'

/**
 * Department Report Aggregator Service
 *
 * Aggregates individual daily reports into department-level reports
 */

import { createClient } from '@/lib/supabase/server'
import { AggregatedReportData } from '@/lib/types/department-reports'
import { DailyReport } from '@/lib/types/daily-reports'

/**
 * Aggregate all individual daily reports for a department on a specific date
 */
export async function aggregateDepartmentReports(
  date: string,
  departmentId: string
): Promise<AggregatedReportData> {
  const supabase = await createClient()

  try {
    // Fetch all individual reports for the department on the date
    const { data: reports, error } = await supabase
      .from('daily_reports')
      .select(`
        id,
        user_id,
        date,
        status,
        tasks_completed,
        tasks_planned,
        blockers,
        notes,
        category_id,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq('department_id', departmentId)
      .eq('date', date)

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`)
    }

    const individualReports = (reports || []) as unknown as Array<{
      id: string
      user_id: string
      date: string
      status: string
      tasks_completed: string[] | null
      tasks_planned: string[] | null
      blockers: string[] | null
      notes: string | null
      category_id: string | null
      profiles: {
        id: string
        full_name: string
        email: string
      } | null
    }>

    // Calculate metrics
    const totalReports = individualReports.length
    const submittedReports = individualReports.filter(r => r.status === 'submitted').length
    const draftReports = individualReports.filter(r => r.status === 'draft').length

    // Calculate task metrics
    const allTasksCompleted = individualReports
      .map(r => r.tasks_completed || [])
      .flat()
    const allTasksPlanned = individualReports
      .map(r => r.tasks_planned || [])
      .flat()
    const allBlockers = individualReports
      .map(r => r.blockers || [])
      .flat()

    const totalTasksCompleted = allTasksCompleted.length
    const totalTasksPlanned = allTasksPlanned.length
    const totalBlockers = allBlockers.length
    const averageTasksCompleted = totalReports > 0 
      ? Math.round((totalTasksCompleted / totalReports) * 10) / 10 
      : 0

    // Group by category
    const reportsByCategory: Record<string, { count: number; submitted: number }> = {}
    individualReports.forEach(report => {
      const categoryKey = report.category_id || 'uncategorized'
      if (!reportsByCategory[categoryKey]) {
        reportsByCategory[categoryKey] = { count: 0, submitted: 0 }
      }
      reportsByCategory[categoryKey].count++
      if (report.status === 'submitted') {
        reportsByCategory[categoryKey].submitted++
      }
    })

    // Get category names
    const categoryIds = Object.keys(reportsByCategory).filter(k => k !== 'uncategorized')
    let categoryMap: Record<string, string> = {}
    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from('daily_report_categories')
        .select('id, name')
        .in('id', categoryIds)
      
      if (categories) {
        categoryMap = Object.fromEntries(
          categories.map(c => [c.id, c.name])
        )
      }
    }

    // Format reports by category with names
    const formattedReportsByCategory: Record<string, { count: number; submitted: number }> = {}
    Object.entries(reportsByCategory).forEach(([key, value]) => {
      const categoryName = key === 'uncategorized' 
        ? 'Uncategorized' 
        : categoryMap[key] || key
      formattedReportsByCategory[categoryName] = value
    })

    // Reports by user
    const reportsByUser = individualReports.map(report => ({
      userId: report.user_id,
      userName: report.profiles?.full_name || 'Unknown',
      reportId: report.id,
      status: report.status,
      tasksCompleted: (report.tasks_completed || []).length,
    }))

    // Generate summary text
    const summary = generateSummary({
      totalReports,
      submittedReports,
      draftReports,
      totalTasksCompleted,
      totalBlockers,
      reportsByCategory: formattedReportsByCategory,
    })

    return {
      totalReports,
      submittedReports,
      draftReports,
      averageTasksCompleted,
      totalTasksCompleted,
      totalTasksPlanned,
      totalBlockers,
      reportsByCategory: formattedReportsByCategory,
      reportsByUser,
      summary,
    }
  } catch (error) {
    console.error('Error aggregating department reports:', error)
    throw error
  }
}

/**
 * Generate a human-readable summary of the aggregated data
 */
function generateSummary(data: {
  totalReports: number
  submittedReports: number
  draftReports: number
  totalTasksCompleted: number
  totalBlockers: number
  reportsByCategory: Record<string, { count: number; submitted: number }>
}): string {
  const parts: string[] = []

  parts.push(`${data.totalReports} total report${data.totalReports !== 1 ? 's' : ''}`)
  
  if (data.submittedReports > 0) {
    parts.push(`${data.submittedReports} submitted`)
  }
  
  if (data.draftReports > 0) {
    parts.push(`${data.draftReports} draft${data.draftReports !== 1 ? 's' : ''}`)
  }

  if (data.totalTasksCompleted > 0) {
    parts.push(`${data.totalTasksCompleted} task${data.totalTasksCompleted !== 1 ? 's' : ''} completed`)
  }

  if (data.totalBlockers > 0) {
    parts.push(`${data.totalBlockers} blocker${data.totalBlockers !== 1 ? 's' : ''} reported`)
  }

  const categoryCount = Object.keys(data.reportsByCategory).length
  if (categoryCount > 1) {
    parts.push(`across ${categoryCount} categories`)
  }

  return parts.join(', ')
}

/**
 * Get individual reports included in an aggregated report
 */
export async function getIndividualReportsForDepartmentReport(
  departmentId: string,
  reportDate: string
): Promise<Array<{
  id: string
  userId: string
  userName: string
  userEmail: string
  date: string
  status: string
  categoryName?: string
  tasksCompleted: number
  tasksPlanned: number
  blockers: number
  notes?: string
}>> {
  const supabase = await createClient()

  try {
    const { data: reports, error } = await supabase
      .from('daily_reports')
      .select(`
        id,
        user_id,
        date,
        status,
        tasks_completed,
        tasks_planned,
        blockers,
        notes,
        category_id,
        profiles:user_id (
          id,
          full_name,
          email
        ),
        daily_report_categories:category_id (
          id,
          name
        )
      `)
      .eq('department_id', departmentId)
      .eq('date', reportDate)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch individual reports: ${error.message}`)
    }

    return (reports || []).map((report: any) => ({
      id: report.id,
      userId: report.user_id,
      userName: report.profiles?.full_name || 'Unknown',
      userEmail: report.profiles?.email || '',
      date: report.date,
      status: report.status,
      categoryName: report.daily_report_categories?.name,
      tasksCompleted: (report.tasks_completed || []).length,
      tasksPlanned: (report.tasks_planned || []).length,
      blockers: (report.blockers || []).length,
      notes: report.notes || undefined,
    }))
  } catch (error) {
    console.error('Error fetching individual reports:', error)
    throw error
  }
}










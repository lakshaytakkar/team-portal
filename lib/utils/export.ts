/**
 * Export utility functions for generating CSV, Excel, and PDF exports
 */

export interface ExportColumn {
  key: string
  label: string
  format?: (value: any) => string
}

export interface ExportOptions {
  filename?: string
  includeHeaders?: boolean
  columns?: ExportColumn[]
}

/**
 * Convert data to CSV format
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  options: ExportOptions = {}
): string {
  const { includeHeaders = true } = options

  // Generate headers
  const headers = columns.map((col) => col.label)
  const rows: string[] = []

  if (includeHeaders) {
    rows.push(headers.map((h) => escapeCSVValue(h)).join(','))
  }

  // Generate data rows
  data.forEach((item) => {
    const row = columns.map((col) => {
      const value = item[col.key]
      const formatted = col.format ? col.format(value) : value ?? ''
      return escapeCSVValue(String(formatted))
    })
    rows.push(row.join(','))
  })

  return rows.join('\n')
}

/**
 * Escape CSV value (handles commas, quotes, newlines)
 */
function escapeCSVValue(value: string): string {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

/**
 * Download CSV file
 */
export function downloadCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  options: ExportOptions = {}
): void {
  const csv = convertToCSV(data, columns, options)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', options.filename || 'export.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export candidates to CSV
 */
export function exportCandidatesToCSV(
  candidates: Array<{
    id: string
    fullName: string
    email: string
    phone: string
    status: string
    source?: string
    positionApplied: string
    createdAt: string
  }>,
  options: { filename?: string; selectedIds?: string[] } = {}
): void {
  const { filename = 'candidates', selectedIds } = options

  let dataToExport = candidates
  if (selectedIds && selectedIds.length > 0) {
    dataToExport = candidates.filter((c) => selectedIds.includes(c.id))
  }

  const columns: ExportColumn[] = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'positionApplied', label: 'Position Applied' },
    { key: 'status', label: 'Status' },
    { key: 'source', label: 'Source' },
    {
      key: 'createdAt',
      label: 'Applied Date',
      format: (value: string) => new Date(value).toLocaleDateString(),
    },
  ]

  downloadCSV(dataToExport, columns, { filename: `${filename}.csv` })
}

/**
 * Export applications to CSV
 */
export function exportApplicationsToCSV(
  applications: Array<{
    id: string
    candidateName: string
    candidateEmail: string
    position: string
    status: string
    source: string
    appliedDate: string
  }>,
  options: { filename?: string; selectedIds?: string[] } = {}
): void {
  const { filename = 'applications', selectedIds } = options

  let dataToExport = applications
  if (selectedIds && selectedIds.length > 0) {
    dataToExport = applications.filter((a) => selectedIds.includes(a.id))
  }

  const columns: ExportColumn[] = [
    { key: 'candidateName', label: 'Candidate Name' },
    { key: 'candidateEmail', label: 'Candidate Email' },
    { key: 'position', label: 'Position' },
    { key: 'status', label: 'Status' },
    { key: 'source', label: 'Source' },
    {
      key: 'appliedDate',
      label: 'Applied Date',
      format: (value: string) => new Date(value).toLocaleDateString(),
    },
  ]

  downloadCSV(dataToExport, columns, { filename: `${filename}.csv` })
}

/**
 * Export interviews to CSV
 */
export function exportInterviewsToCSV(
  interviews: Array<{
    id: string
    candidateName: string
    candidateEmail: string
    position: string
    interviewDate: string
    interviewTime: string
    interviewType: string
    interviewer: { name: string }
    status: string
  }>,
  options: { filename?: string; selectedIds?: string[] } = {}
): void {
  const { filename = 'interviews', selectedIds } = options

  let dataToExport = interviews
  if (selectedIds && selectedIds.length > 0) {
    dataToExport = interviews.filter((i) => selectedIds.includes(i.id))
  }

  const columns: ExportColumn[] = [
    { key: 'candidateName', label: 'Candidate Name' },
    { key: 'candidateEmail', label: 'Candidate Email' },
    { key: 'position', label: 'Position' },
    {
      key: 'interviewDate',
      label: 'Interview Date',
      format: (value: string) => new Date(value).toLocaleDateString(),
    },
    { key: 'interviewTime', label: 'Time' },
    { key: 'interviewType', label: 'Type' },
    { key: 'interviewer', label: 'Interviewer', format: (value: { name: string }) => value.name },
    { key: 'status', label: 'Status' },
  ]

  downloadCSV(dataToExport, columns, { filename: `${filename}.csv` })
}


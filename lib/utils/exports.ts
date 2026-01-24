/**
 * Export utility functions for CSV export functionality
 */

import { canExportData } from './permissions'
import type { Role } from './permissions'

export interface ColumnDefinition {
  key: string
  label: string
  transform?: (value: any, row: any) => string
}

/**
 * Export data to CSV file
 */
export async function exportToCSV(
  data: any[],
  columns: ColumnDefinition[],
  filename: string
): Promise<void> {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Create CSV header
  const headers = columns.map((col) => escapeCSVValue(col.label)).join(',')
  const rows: string[] = [headers]

  // Create CSV rows
  for (const row of data) {
    const values = columns.map((col) => {
      const value = row[col.key]
      const transformedValue = col.transform ? col.transform(value, row) : value
      return escapeCSVValue(transformedValue)
    })
    rows.push(values.join(','))
  }

  // Create CSV content
  const csvContent = rows.join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Escape CSV value to handle commas, quotes, and newlines
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Check if export button should be shown
 */
export function shouldShowExportButton(
  page: string,
  userRole: Role,
  hasData: boolean
): boolean {
  if (!hasData) return false
  return canExportData(userRole, page)
}

/**
 * Generate filename based on page and current date
 */
export function generateExportFilename(page: string, prefix?: string): string {
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
  const pageName = page.split('/').filter(Boolean).join('-') || 'export'
  const baseName = prefix || pageName
  return `${baseName}-${dateStr}`
}

/**
 * Flatten nested objects for CSV export
 */
export function flattenRow(row: any, prefix = ''): Record<string, any> {
  const flattened: Record<string, any> = {}

  for (const key in row) {
    if (row.hasOwnProperty(key)) {
      const value = row[key]
      const newKey = prefix ? `${prefix}.${key}` : key

      if (value === null || value === undefined) {
        flattened[newKey] = ''
      } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenRow(value, newKey))
      } else if (Array.isArray(value)) {
        // Join arrays with semicolon
        flattened[newKey] = value.map(String).join('; ')
      } else if (value instanceof Date) {
        flattened[newKey] = value.toISOString().split('T')[0]
      } else {
        flattened[newKey] = value
      }
    }
  }

  return flattened
}

/**
 * Common column definitions for different entity types
 */
export const projectColumns: ColumnDefinition[] = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  {
    key: 'owner',
    label: 'Owner',
    transform: (value) => (value?.name || value || ''),
  },
  { key: 'progress', label: 'Progress (%)' },
  {
    key: 'dueDate',
    label: 'Due Date',
    transform: (value) => (value ? new Date(value).toLocaleDateString() : ''),
  },
  {
    key: 'createdAt',
    label: 'Created Date',
    transform: (value) => (value ? new Date(value).toLocaleDateString() : ''),
  },
]

export const taskColumns: ColumnDefinition[] = [
  { key: 'name', label: 'Task Name' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  {
    key: 'resource',
    label: 'Assigned To',
    transform: (value) => (value?.name || value || 'Unassigned'),
  },
  {
    key: 'project',
    label: 'Project',
    transform: (value) => (value?.name || value || ''),
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    transform: (value) => (value ? new Date(value).toLocaleDateString() : ''),
  },
  {
    key: 'updatedAt',
    label: 'Last Updated',
    transform: (value) => (value ? new Date(value).toLocaleDateString() : ''),
  },
]

export const callColumns: ColumnDefinition[] = [
  {
    key: 'date',
    label: 'Date',
    transform: (value) => (value ? new Date(value).toLocaleDateString() : ''),
  },
  {
    key: 'time',
    label: 'Time',
    transform: (value) => (value || ''),
  },
  { key: 'contactName', label: 'Contact' },
  { key: 'company', label: 'Company' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'outcome', label: 'Outcome' },
  { key: 'status', label: 'Status' },
  {
    key: 'assignedTo',
    label: 'Assigned To',
    transform: (value) => (value?.name || value || ''),
  },
  { key: 'notes', label: 'Notes' },
]

export const attendanceColumns: ColumnDefinition[] = [
  {
    key: 'date',
    label: 'Date',
    transform: (value) => (value ? new Date(value).toLocaleDateString() : ''),
  },
  {
    key: 'user',
    label: 'User',
    transform: (value) => (value?.name || value?.fullName || value || ''),
  },
  {
    key: 'checkInTime',
    label: 'Check In',
    transform: (value) => (value ? new Date(value).toLocaleTimeString() : ''),
  },
  {
    key: 'checkOutTime',
    label: 'Check Out',
    transform: (value) => (value ? new Date(value).toLocaleTimeString() : ''),
  },
  { key: 'status', label: 'Status' },
  { key: 'notes', label: 'Notes' },
]


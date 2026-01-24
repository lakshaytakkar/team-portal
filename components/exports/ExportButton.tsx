"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCSV, generateExportFilename, shouldShowExportButton, type ColumnDefinition } from "@/lib/utils/exports"
import type { Role } from "@/lib/utils/permissions"

export interface ExportButtonProps {
  data: any[]
  columns: ColumnDefinition[]
  filename?: string
  userRole: Role
  page: string
  disabled?: boolean
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'icon'
  showLabel?: boolean
}

export function ExportButton({
  data,
  columns,
  filename,
  userRole,
  page,
  disabled = false,
  className,
  variant = 'outline',
  size = 'default',
  showLabel = true,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExport = async () => {
    if (!data || data.length === 0) {
      console.warn('No data to export')
      return
    }

    setIsExporting(true)
    try {
      const exportFilename = filename || generateExportFilename(page)
      await exportToCSV(data, columns, exportFilename)
    } catch (error) {
      console.error('Error exporting data:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Check if button should be shown
  if (!shouldShowExportButton(page, userRole, data.length > 0)) {
    return null
  }

  if (size === 'icon') {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleExport}
        disabled={disabled || isExporting || data.length === 0}
        className={className}
        title="Export to CSV"
      >
        <Download className="h-4 w-4" />
        <span className="sr-only">Export to CSV</span>
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={disabled || isExporting || data.length === 0}
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      {showLabel && (isExporting ? 'Exporting...' : 'Export to CSV')}
    </Button>
  )
}


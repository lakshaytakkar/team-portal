/**
 * Hook to manage page-level actions, filters, and exports
 * Provides a unified interface for integrating actions, filters, sorting, and exports
 */

import { useMemo, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { getRowActions, getTopbarActions, type Action, type RowActionContext, type TopbarActionContext } from '@/lib/utils/actions'
import { getAvailableFilters, type FilterDefinition, type FilterValue } from '@/lib/utils/filters'
import { useUser } from './useUser'
import type { Role } from '@/lib/utils/permissions'

export interface UsePageActionsOptions {
  entityType?: 'project' | 'task' | 'call' | 'attendance' | 'user'
  onAction?: (actionId: string, entity?: any) => void
  onFilterChange?: (filters: FilterValue) => void
  onExport?: () => void
  hasSelectedItems?: boolean
  itemCount?: number
}

export function usePageActions(options: UsePageActionsOptions = {}) {
  const pathname = usePathname()
  const { user } = useUser()
  const [filters, setFilters] = useState<FilterValue>({})
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null)

  const userRole = (user?.role || 'executive') as Role
  const userDepartment = user?.department
  const currentUserId = user?.id || ''

  // Get available filters for current page
  const availableFilters = useMemo(() => {
    return getAvailableFilters(pathname, userRole, userDepartment)
  }, [pathname, userRole, userDepartment])

  // Get topbar actions
  const topbarActions = useMemo(() => {
    const context: TopbarActionContext = {
      page: pathname,
      userRole,
      userDepartment,
      currentUserId,
      hasSelectedItems: options.hasSelectedItems,
      itemCount: options.itemCount,
    }
    const actions = getTopbarActions(context)
    
    // Wrap actions with onAction callback
    return {
      primary: actions.primary.map(action => ({
        ...action,
        onClick: () => {
          action.onClick()
          if (options.onAction) {
            options.onAction(action.id)
          }
        },
      })),
      secondary: actions.secondary.map(action => ({
        ...action,
        onClick: () => {
          action.onClick()
          if (options.onAction) {
            options.onAction(action.id)
          }
        },
      })),
    }
  }, [pathname, userRole, userDepartment, currentUserId, options.hasSelectedItems, options.itemCount, options.onAction])

  // Get row actions for an entity
  const getActionsForEntity = useCallback((entity: any): Action[] => {
    if (!options.entityType) return []

    const context: RowActionContext = {
      entityType: options.entityType,
      entity,
      userRole,
      userDepartment,
      currentUserId,
      isOwnEntity: entity.ownerId === currentUserId || entity.assignedTo === currentUserId || entity.userId === currentUserId,
    }

    const actions = getRowActions(context)
    
    // Wrap actions with onAction callback
    return actions.map(action => ({
      ...action,
      onClick: () => {
        action.onClick()
        if (options.onAction) {
          options.onAction(action.id, entity)
        }
      },
    }))
  }, [options.entityType, userRole, userDepartment, currentUserId, options.onAction])

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: FilterValue) => {
    setFilters(newFilters)
    if (options.onFilterChange) {
      options.onFilterChange(newFilters)
    }
  }, [options.onFilterChange])

  // Handle sort change
  const handleSortChange = useCallback((field: string, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction })
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({})
    if (options.onFilterChange) {
      options.onFilterChange({})
    }
  }, [options.onFilterChange])

  return {
    // Filters
    filters,
    availableFilters,
    handleFilterChange,
    clearFilters,
    
    // Sorting
    sortConfig,
    handleSortChange,
    
    // Actions
    topbarActions,
    getActionsForEntity,
    
    // User context
    userRole,
    userDepartment,
    currentUserId,
  }
}


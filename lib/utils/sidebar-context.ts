/**
 * Sidebar context detection and page organization utilities
 */

import type { UserContext } from '@/lib/types/user-context'
import type { MenuItem } from '@/components/layouts/Sidebar'
import { buildSidebarConfig } from './sidebar-config'
import { 
  Home, 
  Grid3x3,
  LayoutDashboard,
  TrendingUp, 
  Briefcase, 
  Users, 
  DollarSign, 
  Receipt, 
  Megaphone, 
  BarChart3, 
  Rocket, 
  Code, 
  Shield 
} from 'lucide-react'

/**
 * Map route patterns to sidebar contexts
 */
export function getSidebarContext(pathname: string): string {
  // Always return 'default' - no context switching, sidebar is always consistent
  return 'default'
  
  // Remove leading slash and split
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length === 0) {
    return 'index'
  }

  const firstSegment = segments[0]

  // Map route prefixes to contexts
  const contextMap: Record<string, string> = {
    'ceo': 'executive',
    'projects': 'operations',
    'tasks': 'operations',
    'manager': 'operations',
    'hr': 'people',
    'recruitment': 'people',
    'leave-requests': 'people',
    'sales': 'sales',
    'finance': 'finance',
    'marketing': 'marketing',
    'analytics': 'analytics',
    'rnd': 'rnd',
    'development': 'development',
    'admin': 'admin',
  }

  return contextMap[firstSegment] || 'index'
}

/**
 * Category mapping for index page
 */
export const CATEGORY_MAP: Record<string, string> = {
  'general': 'general',
  'dashboards': 'dashboards',
  'people': 'people',
  'sales': 'sales',
  'finance': 'finance',
  'marketing': 'marketing',
  'analytics': 'analytics',
  'operations': 'operations',
  'research': 'rnd',
  'development': 'development',
  'admin': 'admin',
}

/**
 * Category labels for display
 */
export const CATEGORY_LABELS: Record<string, string> = {
  'general': 'General',
  'dashboards': 'Dashboards',
  'people': 'People',
  'sales': 'Sales',
  'finance': 'Finance',
  'marketing': 'Marketing',
  'analytics': 'Analytics',
  'operations': 'Operations',
  'rnd': 'Research',
  'development': 'Development',
  'admin': 'Admin',
}

/**
 * Get all pages organized by category for index page
 */
export function getPagesByCategory(user: UserContext | null): Record<string, MenuItem[]> {
  const allItems = buildSidebarConfig(user)
  const categorized: Record<string, MenuItem[]> = {}

  // Initialize all categories
  Object.keys(CATEGORY_LABELS).forEach(category => {
    categorized[category] = []
  })

  // Categorize items
  allItems.forEach(item => {
    if (!item.section) return

    // Map section to category
    const category = CATEGORY_MAP[item.section] || item.section

    // Skip home, dashboard, my-workspace, and team sections for index page
    if (item.section === 'home' || item.section === 'dashboard' || item.section === 'my-workspace' || item.section === 'team') {
      return
    }

    if (categorized[category]) {
      categorized[category].push(item)
    }
  })

  return categorized
}

/**
 * Search pages across all categories
 */
export function searchPages(user: UserContext | null, query: string): MenuItem[] {
  const allItems = buildSidebarConfig(user)
  const searchLower = query.toLowerCase().trim()

  if (!searchLower) return []

  return allItems.filter(item => {
    // Skip home, dashboard, my-workspace, and team
    if (item.section === 'home' || item.section === 'dashboard' || item.section === 'my-workspace' || item.section === 'team') {
      return false
    }

    const labelMatch = item.label.toLowerCase().includes(searchLower)
    const descMatch = item.description?.toLowerCase().includes(searchLower)
    const hrefMatch = item.href.toLowerCase().includes(searchLower)

    return labelMatch || descMatch || hrefMatch
  })
}

/**
 * Get navigation for index page (/index)
 * Shows main sections with key items for quick access
 */
export function getIndexPageNavigation(user: UserContext | null): MenuItem[] {
  if (!user?.isSuperadmin) {
    return []
  }
  
  // Get all items and organize by section
  const allItems = buildSidebarConfig(user)
  
  // Return all items - they'll be grouped by section in the sidebar
  return allItems
}

/**
 * Get menu items for sidebar - always returns all items for consistent sidebar
 */
export function getContextMenuItems(user: UserContext | null, context: string): MenuItem[] {
  // Always return all items - sidebar is always consistent
  return buildSidebarConfig(user)
}


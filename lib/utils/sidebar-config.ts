/**
 * Sidebar configuration builder for v1
 * Generates menu items based on UserContext (superadmin vs employee)
 */

import type { UserContext } from '@/lib/types/user-context'
import type { MenuItem } from '@/components/layouts/Sidebar'
import {
  Home,
  Briefcase,
  Calendar,
  Clock,
  Bell,
  CheckSquare,
  Folder,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Phone,
  Key,
  Users,
  Settings,
  Shield,
  BarChart3,
  StickyNote,
  Target,
  Award,
  FileCheck,
  NotebookPen,
  LayoutDashboard,
  TrendingUp,
  Building2,
  Building,
  UserPlus,
  UserCheck,
  DollarSign,
  Receipt,
  Wallet,
  Megaphone,
  Mail,
  Zap,
  Rocket,
  Code,
  Layers,
  PieChart,
  FileBarChart,
  Globe,
  Network,
  Activity,
  ClipboardList,
  MessageSquare,
  Search,
  Package,
  Palette,
  Sparkles,
  ExternalLink,
  FileText,
  List,
  ClipboardCheck,
  Store,
  Calculator,
  Eye,
  Compass,
  BriefcaseBusiness,
  ArrowLeftRight,
  Grid3x3,
  Edit,
  Droplets,
  UserCog,
  Brain,
  Scale,
  Landmark,
  FileSignature,
  CreditCard,
  ShoppingCart,
  Truck,
  PackageCheck,
} from "lucide-react"

/**
 * Build sidebar menu items based on user context
 * For v1: Employee sees "My Workspace", Superadmin sees only org-wide items (no "my" pages)
 * @param user - User context
 * @param selectedOrganization - Selected organization ID (null = "All", undefined = no filter)
 * @param selectedVertical - Selected vertical ID (null = "All", undefined = no filter)
 * @param selectedDepartment - Selected department ID (null = "All", undefined = no filter)
 */
export function buildSidebarConfig(
  user: UserContext | null,
  selectedOrganizations?: string[],
  selectedVerticals?: string[],
  selectedDepartments?: string[]
): MenuItem[] {
  if (!user) {
    return []
  }

  const items: MenuItem[] = []

  // Dashboard - always visible at top for non-superadmin
  if (!user.isSuperadmin) {
    items.push({
      label: "Dashboard",
      href: "/my-tasks",
      icon: LayoutDashboard,
      section: "dashboard",
      description: "View your overview and quick stats",
    })
  }

  // My Workspace - visible to both employee and superadmin
  const myWorkspaceItems: MenuItem[] = [
    // Work
    {
      label: "My Projects",
      href: "/projects",
      icon: Briefcase,
      section: "my-workspace",
      subSection: "work",
      description: "Manage and track your projects",
    },
      {
        label: "My Tasks",
        href: "/my-tasks",
        icon: CheckSquare,
        section: "my-workspace",
        subSection: "work",
        description: "View and update your assigned tasks",
      },
      {
        label: "My Reminders",
        href: "/my-reminders",
        icon: Bell,
        section: "my-workspace",
        subSection: "work",
        description: "View and manage your reminders",
      },
    {
      label: "My Calls",
      href: "/my-calls",
      icon: Phone,
      section: "my-workspace",
      subSection: "work",
      description: "Track and manage your sales and outreach calls",
    },
    {
      label: "My Training",
      href: "/my-training",
      icon: GraduationCap,
      section: "my-workspace",
      subSection: "work",
      description: "Access daily training materials and courses",
    },
    {
      label: "My Daily Reporting",
      href: "/my-daily-reporting",
      icon: FileCheck,
      section: "my-workspace",
      subSection: "work",
      description: "Submit and track your daily reports",
    },
    {
      label: "My Meeting Notes",
      href: "/my-meeting-notes",
      icon: NotebookPen,
      section: "my-workspace",
      subSection: "work",
      description: "View and manage your meeting notes",
    },
    // Time & Attendance
    {
      label: "My Attendance",
      href: "/my-attendance",
      icon: Clock,
      section: "my-workspace",
      subSection: "time",
      description: "Check in, check out, and view attendance history",
    },
    {
      label: "My Leave Requests",
      href: "/my-leave-requests",
      icon: CalendarDays,
      section: "my-workspace",
      subSection: "time",
      description: "Request time off and view leave status",
    },
    {
      label: "My Calendar",
      href: "/my-calendar",
      icon: Calendar,
      section: "my-workspace",
      subSection: "time",
      description: "View your schedule and upcoming events",
    },
    // Personal
    {
      label: "My Documents",
      href: "/my-documents",
      icon: Folder,
      section: "my-workspace",
      subSection: "personal",
      description: "Access and manage your files",
    },
    {
      label: "My Goals",
      href: "/my-goals",
      icon: Target,
      section: "my-workspace",
      subSection: "personal",
      description: "View and manage your goals and OKRs",
    },
    {
      label: "My Notes",
      href: "/my-notes",
      icon: StickyNote,
      section: "my-workspace",
      subSection: "personal",
      description: "Your personal notes",
    },
  ]

  // My Workspace - only visible to non-superadmin users
  if (!user.isSuperadmin) {
    items.push(...myWorkspaceItems)
  }

  // Team & Organization - visible to both
  items.push(
    {
      label: "Knowledge Base",
      href: "/knowledge-base",
      icon: BookOpen,
      section: "team",
      description: "Browse company documentation and guides",
    },
    {
      label: "Resources",
      href: "/my-resources",
      icon: Key,
      section: "team",
      description: "Access external apps, credentials, and integrations",
    }
  )

  // Org-wide items - only for superadmin
  if (user.isSuperadmin) {
    // GENERAL - Core navigation
    items.push(
      {
        label: "Main Dashboard",
        href: "/ceo/dashboard",
        icon: LayoutDashboard,
        section: "general",
        description: "Executive overview and key metrics",
        alwaysVisible: true, // Always visible regardless of org/vertical filters
      },
      {
        label: "Explore",
        href: "/explore",
        icon: Grid3x3,
        section: "general",
        description: "Browse all pages and functions",
        alwaysVisible: true, // Always visible regardless of org/vertical filters
      }
    )

    // DASHBOARDS - Department summaries
    items.push(
      {
        label: "Finance Dashboard",
        href: "/finance/dashboard",
        icon: DollarSign,
        section: "dashboards",
        description: "Financial overview and metrics",
      },
      {
        label: "Sales Dashboard",
        href: "/sales/dashboard",
        icon: TrendingUp,
        section: "dashboards",
        description: "Sales performance and pipeline",
      },
      {
        label: "Marketing Dashboard",
        href: "/marketing/dashboard",
        icon: Megaphone,
        section: "dashboards",
        description: "Marketing campaigns and performance",
      },
      {
        label: "HR Dashboard",
        href: "/hr/dashboard",
        icon: Users,
        section: "dashboards",
        description: "HR metrics and workforce insights",
      },
      {
        label: "Recruitment Dashboard",
        href: "/recruitment/dashboard",
        icon: UserPlus,
        section: "dashboards",
        description: "Recruitment pipeline and hiring",
        alwaysVisible: true, // Always visible regardless of org/vertical filters
      },
      {
        label: "Analytics Dashboard",
        href: "/analytics/dashboard",
        icon: BarChart3,
        section: "dashboards",
        description: "Analytics dashboard and insights",
      },
      {
        label: "Operations Dashboard",
        href: "/ceo/operations-summary",
        icon: Activity,
        section: "dashboards",
        description: "Operations overview and efficiency",
      }
    )

    // CEO - Executive summaries and explorers
    items.push(
      {
        label: "Performance Analytics",
        href: "/ceo/performance-analytics",
        icon: TrendingUp,
        section: "dashboards",
        description: "Performance metrics and analytics",
      },
      {
        label: "Department Oversight",
        href: "/ceo/department-oversight",
        icon: Building2,
        section: "dashboards",
        description: "Department performance overview",
      },
      {
        label: "Team Management",
        href: "/ceo/team-management",
        icon: Users,
        section: "dashboards",
        description: "Team structure and management",
      },
      {
        label: "Reports",
        href: "/ceo/reports",
        icon: FileBarChart,
        section: "dashboards",
        description: "Executive reports and insights",
      }
    )

    // PEOPLE - HR and recruitment
    items.push(
      {
        label: "Employees",
        href: "/hr/employees",
        icon: Users,
        section: "people",
        description: "Manage all employees and profiles",
      },
      {
        label: "Teams",
        href: "/hr/teams",
        icon: Network,
        section: "people",
        description: "Manage teams and structure",
      },
      {
        label: "Assets",
        href: "/hr/assets",
        icon: Package,
        section: "people",
        description: "Manage company assets and equipment",
      },
      {
        label: "Onboarding",
        href: "/hr/onboarding",
        icon: UserCheck,
        section: "people",
        description: "Manage employee onboarding processes",
      },
      {
        label: "Roles",
        href: "/hr/roles",
        icon: UserCog,
        section: "people",
        description: "Manage organizational roles",
      },
      {
        label: "Verticals",
        href: "/hr/verticals",
        icon: Layers,
        section: "people",
        description: "Manage company verticals",
      },
      {
        label: "Templates",
        href: "/hr/templates",
        icon: FileText,
        section: "people",
        description: "Manage HR templates",
      },
      {
        label: "Leave Requests",
        href: "/leave-requests",
        icon: CalendarDays,
        section: "people",
        description: "View and manage leave requests",
      },
      {
        label: "Candidates",
        href: "/recruitment/candidates",
        icon: UserCheck,
        section: "people",
        description: "Manage recruitment candidates",
        alwaysVisible: true, // Always visible regardless of org/vertical filters
      },
      {
        label: "Applications",
        href: "/recruitment/applications",
        icon: ClipboardList,
        section: "people",
        description: "View and manage applications",
        alwaysVisible: true, // Always visible regardless of org/vertical filters
      },
      {
        label: "Interviews",
        href: "/recruitment/interviews",
        icon: MessageSquare,
        section: "people",
        description: "Schedule and manage interviews",
        alwaysVisible: true, // Always visible regardless of org/vertical filters
      },
      {
        label: "Evaluations",
        href: "/recruitment/evaluations",
        icon: ClipboardCheck,
        section: "people",
        description: "View candidate evaluations",
        alwaysVisible: true, // Always visible regardless of org/vertical filters
      },
      {
        label: "Job Roles",
        href: "/recruitment/job-roles",
        icon: Briefcase,
        section: "people",
        description: "Manage job roles and positions",
        alwaysVisible: true, // Always visible regardless of org/vertical filters
      },
      {
        label: "Job Postings",
        href: "/recruitment/job-postings",
        icon: FileText,
        section: "people",
        description: "Manage job postings",
        alwaysVisible: true, // Always visible regardless of org/vertical filters
      },
      {
        label: "Job Portals",
        href: "/recruitment/job-portals",
        icon: Globe,
        section: "people",
        description: "Manage job portal integrations",
        alwaysVisible: true, // Always visible regardless of org/vertical filters
      },
      {
        label: "Job Listings",
        href: "/recruitment/job-listings",
        icon: List,
        section: "people",
        description: "View all job listings",
        alwaysVisible: true, // Always visible regardless of org/vertical filters
      }
    )

    // SALES - Sales and revenue
    items.push(
      {
        label: "Pipeline",
        href: "/sales/pipeline",
        icon: TrendingUp,
        section: "sales",
        description: "Sales pipeline management",
      },
      {
        label: "Leads",
        href: "/sales/leads",
        icon: Search,
        section: "sales",
        description: "Manage sales leads",
      },
      {
        label: "Deals",
        href: "/sales/deals",
        icon: BriefcaseBusiness,
        section: "sales",
        description: "Track and manage deals",
      },
      {
        label: "Quotations",
        href: "/sales/quotations",
        icon: FileText,
        section: "sales",
        description: "Create and manage quotations",
      }
    )

    // FINANCE - Financial management
    items.push(
      {
        label: "Invoices",
        href: "/finance/invoices",
        icon: FileText,
        section: "finance",
        description: "Create and manage invoices",
      },
      {
        label: "Expenses",
        href: "/finance/expenses",
        icon: DollarSign,
        section: "finance",
        description: "Track and manage expenses",
      },
      {
        label: "Payroll",
        href: "/finance/payroll",
        icon: Wallet,
        section: "finance",
        description: "Manage payroll and salaries",
      },
      {
        label: "Transactions",
        href: "/finance/transactions",
        icon: ArrowLeftRight,
        section: "finance",
        description: "View all transactions",
      },
      {
        label: "Sales Orders",
        href: "/finance/sales-orders",
        icon: Receipt,
        section: "finance",
        description: "Manage sales orders",
      },
      {
        label: "Vendors",
        href: "/finance/vendors",
        icon: Store,
        section: "finance",
        description: "Manage vendor information",
      },
      {
        label: "Taxes",
        href: "/finance/taxes",
        icon: Calculator,
        section: "finance",
        description: "Manage tax information",
      },
      {
        label: "Reports",
        href: "/finance/reports",
        icon: FileBarChart,
        section: "finance",
        description: "Generate financial reports",
      }
    )

    // MARKETING - Marketing and campaigns
    items.push(
      {
        label: "Campaigns",
        href: "/marketing/campaigns",
        icon: Megaphone,
        section: "marketing",
        description: "Create and manage campaigns",
      },
      {
        label: "Email Templates",
        href: "/marketing/email-templates",
        icon: Mail,
        section: "marketing",
        description: "Create email templates",
      },
      {
        label: "WhatsApp Templates",
        href: "/marketing/whatsapp-templates",
        icon: MessageSquare,
        section: "marketing",
        description: "Create WhatsApp templates",
      },
      {
        label: "Email Automations",
        href: "/marketing/email-automations",
        icon: Zap,
        section: "marketing",
        description: "Configure email automation workflows",
      },
      {
        label: "WhatsApp Automations",
        href: "/marketing/whatsapp-automations",
        icon: Zap,
        section: "marketing",
        description: "Configure WhatsApp automation workflows",
      },
      {
        label: "Drips",
        href: "/marketing/drips",
        icon: Droplets,
        section: "marketing",
        description: "Manage drip campaigns",
      },
      {
        label: "Pages",
        href: "/marketing/pages",
        icon: FileText,
        section: "marketing",
        description: "Manage marketing pages",
      },
      {
        label: "Automation Logs",
        href: "/marketing/automation-logs",
        icon: Activity,
        section: "marketing",
        description: "View automation execution logs",
      },
      {
        label: "Content",
        href: "/marketing/content-editor",
        icon: Edit,
        section: "marketing",
        description: "Edit marketing content",
      }
    )

    // ANALYTICS - Analytics and insights
    items.push(
      {
        label: "Traffic",
        href: "/analytics/website-traffic",
        icon: Activity,
        section: "analytics",
        description: "Website traffic analytics",
      },
      {
        label: "Conversions",
        href: "/analytics/conversions",
        icon: TrendingUp,
        section: "analytics",
        description: "Track conversions and goals",
      },
      {
        label: "Domains",
        href: "/analytics/domains",
        icon: Globe,
        section: "analytics",
        description: "Manage tracked domains",
      },
      {
        label: "Reports",
        href: "/analytics/client-reports",
        icon: FileBarChart,
        section: "analytics",
        description: "Generate analytics reports",
      }
    )

    // RESEARCH - Research and development
    items.push(
      {
        label: "Research",
        href: "/rnd/research-docs",
        icon: FileText,
        section: "research",
        description: "Research documentation",
      },
      {
        label: "Mindmaps",
        href: "/rnd/mindmaps",
        icon: Brain,
        section: "research",
        description: "Visual mind mapping",
      },
      {
        label: "Financial Planning",
        href: "/rnd/financial-planning",
        icon: DollarSign,
        section: "research",
        description: "Financial planning and analysis",
      },
      {
        label: "New Verticals",
        href: "/rnd/new-verticals",
        icon: Rocket,
        section: "research",
        description: "Explore new business verticals",
      },
      {
        label: "Market Research",
        href: "/rnd/market-research",
        icon: BarChart3,
        section: "research",
        description: "Market research and analysis",
      },
      {
        label: "Planning",
        href: "/rnd/strategic-planning",
        icon: Target,
        section: "research",
        description: "Strategic planning",
      },
      {
        label: "Ideas",
        href: "/rnd/suggestions",
        icon: Sparkles,
        section: "research",
        description: "Innovation suggestions",
      }
    )

    // DEVELOPMENT - Development and tech
    items.push(
      {
        label: "Projects",
        href: "/dev/projects",
        icon: Folder,
        section: "development",
        description: "Development projects",
      },
      {
        label: "Components",
        href: "/dev/design-system/components",
        icon: Code,
        section: "development",
        description: "Component library",
      },
      {
        label: "Docs",
        href: "/dev/docs",
        icon: BookOpen,
        section: "development",
        description: "Development documentation",
      }
    )

    // OPERATIONS - Projects and tasks
    items.push(
      {
        label: "Projects",
        href: "/projects",
        icon: Briefcase,
        section: "operations",
        description: "View and manage projects",
      },
      {
        label: "Tasks",
        href: "/tasks",
        icon: CheckSquare,
        section: "operations",
        description: "View and manage tasks",
      },
      {
        label: "Daily Reporting",
        href: "/daily-reporting",
        icon: FileCheck,
        section: "operations",
        description: "View and manage all employee daily reports",
      },
      {
        label: "Calls",
        href: "/ceo/explorers/calls",
        icon: Phone,
        section: "operations",
        description: "View and manage calls",
      },
      {
        label: "Projects Explorer",
        href: "/ceo/explorers/projects",
        icon: Eye,
        section: "operations",
        description: "Explore all projects",
      },
      {
        label: "Tasks Explorer",
        href: "/ceo/explorers/tasks",
        icon: Eye,
        section: "operations",
        description: "Explore all tasks",
      },
      {
        label: "Deals Explorer",
        href: "/ceo/explorers/deals",
        icon: Eye,
        section: "operations",
        description: "Explore all deals",
      },
      {
        label: "Employees Explorer",
        href: "/ceo/explorers/employees",
        icon: Eye,
        section: "operations",
        description: "Explore all employees",
      }
    )

    // ADMIN - System administration
    items.push(
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
        section: "admin",
        description: "Manage users and roles",
      },
      {
        label: "Organizations",
        href: "/admin/organizations",
        icon: Building,
        section: "admin",
        description: "Manage organizations",
      },
      {
        label: "Verticals",
        href: "/admin/verticals",
        icon: Layers,
        section: "admin",
        description: "Manage business verticals",
      },
      {
        label: "Permissions",
        href: "/admin/permissions",
        icon: Shield,
        section: "admin",
        description: "Manage permissions",
      },
      {
        label: "Credentials",
        href: "/admin/credentials",
        icon: Key,
        section: "admin",
        description: "Manage system credentials",
      },
      {
        label: "Tasks",
        href: "/admin/tasks",
        icon: CheckSquare,
        section: "admin",
        description: "View all tasks",
      },
      {
        label: "Reminders",
        href: "/admin/reminders",
        icon: Bell,
        section: "admin",
        description: "Manage reminders for users",
      },
      {
        label: "Training",
        href: "/admin/training",
        icon: GraduationCap,
        section: "admin",
        description: "Manage training courses and playlists",
      },
      {
        label: "Attendance",
        href: "/admin/attendance",
        icon: Clock,
        section: "admin",
        description: "View and manage employee attendance",
      },
      {
        label: "Meeting Notes",
        href: "/admin/meeting-notes",
        icon: NotebookPen,
        section: "admin",
        description: "View and manage employee meeting notes",
      },
      {
        label: "Documents",
        href: "/admin/documents",
        icon: Folder,
        section: "admin",
        description: "View and manage employee documents",
      },
      {
        label: "Calls",
        href: "/admin/calls",
        icon: Phone,
        section: "admin",
        description: "View and manage all calls",
      },
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        section: "admin",
        description: "Admin analytics and insights",
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        section: "admin",
        description: "System settings",
        alwaysVisible: true, // Always visible regardless of org/vertical filters
      }
    )

    // LEGAL NATIONS - LLC Formation Services
    items.push(
      {
        label: "Legal Nations Dashboard",
        href: "/legal-nations/dashboard",
        icon: Scale,
        section: "legal-nations",
        description: "LLC formation service overview",
      },
      {
        label: "All Clients",
        href: "/legal-nations/clients",
        icon: Users,
        section: "legal-nations",
        description: "View all LLC clients",
      },
      {
        label: "Applications Pipeline",
        href: "/legal-nations/applications",
        icon: FileSignature,
        section: "legal-nations",
        description: "Track LLC formation stages",
      },
      {
        label: "Bank Approvals",
        href: "/legal-nations/bank-approvals",
        icon: Landmark,
        section: "legal-nations",
        description: "Track US bank account applications",
      }
    )

    // FAIRE WHOLESALE - E-commerce Wholesale Management (USA)
    items.push(
      {
        label: "Dashboard",
        href: "/faire-wholesale",
        icon: LayoutDashboard,
        section: "faire-wholesale",
        description: "Faire wholesale overview and KPIs",
      },
      {
        label: "Faire Stores",
        href: "/faire-wholesale/stores",
        icon: Store,
        section: "faire-wholesale",
        description: "Manage Faire seller accounts",
      },
      {
        label: "Orders",
        href: "/faire-wholesale/orders",
        icon: ShoppingCart,
        section: "faire-wholesale",
        description: "View and manage wholesale orders",
      },
      {
        label: "Retailers",
        href: "/faire-wholesale/retailers",
        icon: Users,
        section: "faire-wholesale",
        description: "View retailers and customers",
      },
      {
        label: "Products",
        href: "/faire-wholesale/products",
        icon: Package,
        section: "faire-wholesale",
        description: "Manage product catalog",
      },
      {
        label: "Suppliers",
        href: "/faire-wholesale/suppliers",
        icon: Truck,
        section: "faire-wholesale",
        description: "Manage USA suppliers",
      },
      {
        label: "Shipments",
        href: "/faire-wholesale/shipments",
        icon: PackageCheck,
        section: "faire-wholesale",
        description: "Track order shipments",
      }
    )
  }

  // LEGAL NATIONS - For non-superadmin users (their assigned clients)
  if (!user.isSuperadmin) {
    items.push(
      {
        label: "My LLC Clients",
        href: "/legal-nations/my-clients",
        icon: Scale,
        section: "my-workspace",
        subSection: "work",
        description: "Manage your assigned LLC clients",
      }
    )
  }

  // Filter items by selected organization, vertical, and department ONLY for superadmin
  // If selections are undefined, it means user is not superadmin or filtering is disabled
  const isFilteringEnabled = user.isSuperadmin &&
    (selectedOrganizations !== undefined || selectedVerticals !== undefined || selectedDepartments !== undefined)
  
  if (isFilteringEnabled) {
    return items.filter((item) => {
      // Always show items marked as alwaysVisible (e.g., Recruitment, Settings)
      if (item.alwaysVisible === true) {
        return true
      }

      // Organization filtering
      if (selectedOrganizations !== undefined) {
        if (selectedOrganizations.length === 0) {
          // "All" selected - show all items
        } else {
          // Specific organizations selected
          // Show items that:
          // 1. Have no organizationId assigned (undefined) - legacy items, show for all
          // 2. Have organizationId === null (shared pages) - show for all organizations
          // 3. Match any of the selected organizations
          if (item.organizationId !== undefined && 
              item.organizationId !== null && 
              !selectedOrganizations.includes(item.organizationId)) {
            return false
          }
        }
      }

      // Vertical filtering
      if (selectedVerticals !== undefined) {
        if (selectedVerticals.length === 0) {
          // "All" selected - show all items
        } else {
          // Specific verticals selected
          // Show items that:
          // 1. Have no verticalId assigned (undefined) - legacy items, show for all
          // 2. Have verticalId === null (shared pages) - show for all verticals
          // 3. Match any of the selected verticals
          if (item.verticalId !== undefined && 
              item.verticalId !== null && 
              !selectedVerticals.includes(item.verticalId)) {
            return false
          }
        }
      }

      // Department filtering
      if (selectedDepartments !== undefined) {
        if (selectedDepartments.length === 0) {
          // "All" selected - show all items
        } else {
          // Specific departments selected
          // Show items that:
          // 1. Have no departmentId assigned (undefined) - legacy items, show for all
          // 2. Have departmentId === null (shared pages) - show for all departments
          // 3. Match any of the selected departments
          if (item.departmentId !== undefined && 
              item.departmentId !== null && 
              !selectedDepartments.includes(item.departmentId)) {
            return false
          }
        }
      }

      return true
    })
  }

  return items
}

/**
 * Get section labels for sidebar
 */
export function getSectionLabel(section: string): string {
  const labels: Record<string, string> = {
    home: "",
    dashboard: "",
    categories: "",
    general: "General",
    dashboards: "Dashboards",
    "my-workspace": "My Workspace",
    people: "People",
    sales: "Sales",
    finance: "Finance",
    marketing: "Marketing",
    analytics: "Analytics",
    operations: "Operations",
    research: "Research",
    development: "Development",
    "legal-nations": "Legal Nations",
    "faire-wholesale": "Faire Wholesale",
    admin: "Admin",
    team: "Resources",
  }
  return labels[section] || ""
}

/**
 * Get section order for sidebar
 * Organized logically: Overview → Operations → Departments → Support Functions
 */
export function getSectionOrder(): string[] {
  return [
    "dashboard",
    "general",
    "dashboards",
    "my-workspace",
    "people",
    "sales",
    "finance",
    "marketing",
    "analytics",
    "operations",
    "research",
    "development",
    "legal-nations",
    "faire-wholesale",
    "admin",
    "team",
  ]
}


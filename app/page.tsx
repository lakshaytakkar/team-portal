"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageLinkTile } from "@/components/dashboard/PageLinkTile"
import { PageLinkListItem } from "@/components/dashboard/PageLinkListItem"
import { useUser } from "@/lib/hooks/useUser"
import { LogIn } from "lucide-react"
import {
  Home as HomeIcon,
  Briefcase,
  CheckSquare,
  Phone,
  Clock,
  CalendarDays,
  Calendar,
  Folder,
  Target,
  Award,
  StickyNote,
  BookOpen,
  Key,
  GraduationCap,
  FileCheck,
  NotebookPen,
  Users,
  UserPlus,
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Receipt,
  DollarSign,
  Wallet,
  ArrowLeftRight,
  Store,
  Calculator,
  Mail,
  MessageSquare,
  Zap,
  Layers,
  Megaphone,
  Activity,
  Edit,
  FileText,
  FileBarChart,
  LinkIcon,
  Network,
  Rocket,
  Search,
  Palette,
  Code,
  Grid3x3,
  Sparkles,
  Package,
  ExternalLink,
  Shield,
  Settings,
  Building2,
  PieChart,
  ClipboardList,
  UserCheck,
  ClipboardCheck,
  List,
  UserCog,
  Globe,
  FileEdit,
} from "lucide-react"

const pageSections = [
  {
    title: "My Workspace",
    description: "Personal work management and productivity tools",
    subsections: [
      {
        title: "Work",
        pages: [
          { title: "My Projects", href: "/projects", icon: Briefcase, description: "Manage and track your projects" },
          { title: "My Tasks", href: "/tasks", icon: CheckSquare, description: "View and update your assigned tasks" },
          { title: "My Calls", href: "/my-calls", icon: Phone, description: "Track and manage your sales and outreach calls" },
          { title: "My Training", href: "/my-training", icon: GraduationCap, description: "Access daily training materials and courses" },
          { title: "My Daily Reporting", href: "/my-daily-reporting", icon: FileCheck, description: "Submit and track your daily reports" },
          { title: "My Meeting Notes", href: "/my-meeting-notes", icon: NotebookPen, description: "View and manage your meeting notes" },
        ],
      },
      {
        title: "Time & Attendance",
        pages: [
          { title: "My Attendance", href: "/my-attendance", icon: Clock, description: "Check in, check out, and view attendance history" },
          { title: "My Leave Requests", href: "/my-leave-requests", icon: CalendarDays, description: "Request time off and view leave status" },
          { title: "My Calendar", href: "/my-calendar", icon: Calendar, description: "View your schedule and upcoming events" },
        ],
      },
      {
        title: "Personal",
        pages: [
          { title: "My Documents", href: "/my-documents", icon: Folder, description: "Access and manage your files" },
          { title: "My Goals", href: "/my-goals", icon: Target, description: "View and manage your goals and OKRs" },
          { title: "My Performance Reviews", href: "/my-performance-reviews", icon: Award, description: "View your performance reviews and feedback" },
          { title: "My Notes", href: "/my-notes", icon: StickyNote, description: "Your personal notes" },
        ],
      },
    ],
  },
  {
    title: "Team & Organization",
    description: "Shared resources and knowledge",
    pages: [
      { title: "Knowledge Base", href: "/knowledge-base", icon: BookOpen, description: "Browse company documentation and guides" },
      { title: "My Resources", href: "/my-resources", icon: Key, description: "Access external apps, credentials, and integrations" },
    ],
  },
  {
    title: "HR & Recruitment",
    description: "Human resources and talent acquisition",
    subsections: [
      {
        title: "HR",
        pages: [
          { title: "HR Dashboard", href: "/hr/dashboard", icon: LayoutDashboard, description: "HR metrics and employee overview" },
          { title: "Employees", href: "/hr/employees", icon: Users, description: "Manage employees" },
          { title: "Leave Requests", href: "/hr/leave-requests", icon: CalendarDays, description: "Manage all employee leave requests" },
          { title: "Onboarding", href: "/hr/onboarding", icon: UserCheck, description: "Manage employee onboarding" },
          { title: "Assets", href: "/hr/assets", icon: Package, description: "Manage organizational assets and assignments" },
          { title: "Templates", href: "/hr/templates", icon: FileText, description: "Manage HR templates" },
        ],
      },
      {
        title: "Recruitment",
        pages: [
          { title: "Recruitment Dashboard", href: "/recruitment/dashboard", icon: LayoutDashboard, description: "Recruitment metrics and overview" },
          { title: "Candidates", href: "/recruitment/candidates", icon: UserPlus, description: "Manage candidates" },
          { title: "Applications", href: "/recruitment/applications", icon: ClipboardList, description: "View and manage job applications" },
          { title: "Interviews", href: "/recruitment/interviews", icon: MessageSquare, description: "Schedule and manage interviews" },
          { title: "Job Postings", href: "/recruitment/job-postings", icon: List, description: "Create and manage job postings" },
          { title: "Job Roles", href: "/recruitment/job-roles", icon: UserCog, description: "Define and manage job roles" },
          { title: "Job Portals", href: "/recruitment/job-portals", icon: Globe, description: "Manage job portal integrations" },
          { title: "Evaluations", href: "/recruitment/evaluations", icon: ClipboardCheck, description: "Review candidate evaluations" },
        ],
      },
    ],
  },
  {
    title: "Sales",
    description: "Sales pipeline and customer management",
    pages: [
      { title: "Sales Dashboard", href: "/sales/dashboard", icon: LayoutDashboard, description: "Sales metrics and revenue overview" },
      { title: "Leads", href: "/sales/leads", icon: TrendingUp, description: "Manage sales leads" },
      { title: "Pipeline", href: "/sales/pipeline", icon: BarChart3, description: "Track sales pipeline" },
      { title: "Deals", href: "/sales/deals", icon: Briefcase, description: "Manage deals" },
      { title: "Quotations", href: "/sales/quotations", icon: FileText, description: "Create and track quotations" },
      { title: "Automation Logs", href: "/sales/automation-logs", icon: Activity, description: "Track automation activity and messages" },
    ],
  },
  {
    title: "Marketing",
    description: "Campaigns, automations, and content management",
    subsections: [
      {
        title: "Dashboard & Analytics",
        pages: [
          { title: "Marketing Dashboard", href: "/marketing/dashboard", icon: LayoutDashboard, description: "Campaign performance and metrics overview" },
          { title: "Automation Logs", href: "/marketing/automation-logs", icon: Activity, description: "Track sent messages, opens, clicks, responses" },
        ],
      },
      {
        title: "Templates",
        pages: [
          { title: "Email Templates", href: "/marketing/email-templates", icon: Mail, description: "Create and manage reusable email templates" },
          { title: "WhatsApp Templates", href: "/marketing/whatsapp-templates", icon: MessageSquare, description: "Create and manage reusable WhatsApp templates" },
        ],
      },
      {
        title: "Automations",
        pages: [
          { title: "Email Automations", href: "/marketing/email-automations", icon: Zap, description: "Create automated email workflows" },
          { title: "WhatsApp Automations", href: "/marketing/whatsapp-automations", icon: Zap, description: "Create automated WhatsApp workflows" },
          { title: "Drips", href: "/marketing/drips", icon: Layers, description: "Create email sequence campaigns" },
        ],
      },
      {
        title: "Content",
        pages: [
          { title: "Campaigns", href: "/marketing/campaigns", icon: Megaphone, description: "Multi-channel campaign management" },
          { title: "Content Editor", href: "/marketing/content-editor", icon: Edit, description: "Edit website content, pages, blog posts" },
          { title: "Page Management", href: "/marketing/pages", icon: FileText, description: "Create, edit, delete website pages" },
        ],
      },
    ],
  },
  {
    title: "Analytics",
    description: "Website analytics and reporting",
    pages: [
      { title: "Analytics Dashboard", href: "/analytics/dashboard", icon: LayoutDashboard, description: "Overview dashboard for all managed websites" },
      { title: "Website Traffic", href: "/analytics/website-traffic", icon: TrendingUp, description: "View website traffic analytics" },
      { title: "Conversion Tracking", href: "/analytics/conversions", icon: Target, description: "Track conversions, leads, and sales" },
      { title: "Client Reports", href: "/analytics/client-reports", icon: FileBarChart, description: "Generate and manage client reports" },
      { title: "Domains", href: "/analytics/domains", icon: LinkIcon, description: "Manage domains and DNS settings" },
    ],
  },
  {
    title: "Finance",
    description: "Financial management and accounting",
    pages: [
      { title: "Finance Dashboard", href: "/finance/dashboard", icon: LayoutDashboard, description: "Financial metrics and transaction overview" },
      { title: "Sales Orders", href: "/finance/sales-orders", icon: ClipboardList, description: "Manage sales orders and convert to invoices" },
      { title: "Invoices", href: "/finance/invoices", icon: Receipt, description: "Manage invoices, payments, and billing" },
      { title: "Expenses", href: "/finance/expenses", icon: DollarSign, description: "Track and approve expenses" },
      { title: "Payroll", href: "/finance/payroll", icon: Wallet, description: "Employee payroll management" },
      { title: "Transactions", href: "/finance/transactions", icon: ArrowLeftRight, description: "All financial transactions" },
      { title: "Vendors", href: "/finance/vendors", icon: Store, description: "Vendor management" },
      { title: "Taxes", href: "/finance/taxes", icon: Calculator, description: "Tax management and filing" },
      { title: "Financial Reports", href: "/finance/reports", icon: BarChart3, description: "P&L, balance sheets, and financial reports" },
    ],
  },
  {
    title: "R&D",
    description: "Research, planning, and strategic initiatives",
    pages: [
      { title: "Research Docs", href: "/rnd/research-docs", icon: BookOpen, description: "Research findings, papers, studies" },
      { title: "Mindmaps", href: "/rnd/mindmaps", icon: Network, description: "Visual research planning, brainstorming" },
      { title: "Financial Planning", href: "/rnd/financial-planning", icon: DollarSign, description: "Budget planning for new verticals" },
      { title: "New Verticals", href: "/rnd/new-verticals", icon: Rocket, description: "Exploring new business opportunities" },
      { title: "Suggestions", href: "/rnd/suggestions", icon: MessageSquare, description: "Enhancement suggestions for current systems" },
      { title: "Strategic Planning", href: "/rnd/strategic-planning", icon: Target, description: "High-level strategic initiatives" },
      { title: "Market Research", href: "/rnd/market-research", icon: Search, description: "Market analysis, competitor research" },
    ],
  },
  {
    title: "Manager",
    description: "Team management and oversight",
    pages: [
      { title: "Manager Dashboard", href: "/manager/dashboard", icon: LayoutDashboard, description: "Team metrics and performance overview" },
      { title: "Team Tasks", href: "/tasks", icon: CheckSquare, description: "View and manage team tasks" },
      { title: "Team Projects", href: "/projects", icon: Briefcase, description: "View and manage team projects" },
      { title: "Team Attendance", href: "/manager/attendance", icon: Clock, description: "Track team attendance and approvals" },
      { title: "Team Leave Requests", href: "/manager/leave-requests", icon: CalendarDays, description: "Approve and manage team leave requests" },
      { title: "Team Performance", href: "/manager/performance", icon: TrendingUp, description: "View team performance metrics" },
    ],
  },
  {
    title: "CEO",
    description: "Executive overview and organization-wide insights",
    subsections: [
      {
        title: "Summary",
        pages: [
          { title: "Executive Dashboard", href: "/ceo/dashboard", icon: HomeIcon, description: "Cross-department overview and executive summaries" },
          { title: "Sales Summary", href: "/ceo/sales-summary", icon: TrendingUp, description: "Sales department summary and metrics" },
          { title: "HR Summary", href: "/ceo/hr-summary", icon: UserCheck, description: "HR department summary and metrics" },
          { title: "Recruitment Summary", href: "/ceo/recruitment-summary", icon: UserPlus, description: "Recruitment pipeline summary" },
          { title: "Operations Summary", href: "/ceo/operations-summary", icon: Building2, description: "Operations and business metrics" },
        ],
      },
      {
        title: "Explorers",
        pages: [
          { title: "All Projects", href: "/ceo/explorers/projects", icon: Briefcase, description: "Explore all projects across the organization" },
          { title: "All Tasks", href: "/ceo/explorers/tasks", icon: CheckSquare, description: "Explore all tasks across the organization" },
          { title: "All Calls", href: "/ceo/explorers/calls", icon: Phone, description: "Explore all calls across the organization" },
          { title: "All Employees", href: "/ceo/explorers/employees", icon: Users, description: "Explore all employees and teams" },
          { title: "All Deals", href: "/ceo/explorers/deals", icon: Briefcase, description: "Explore all deals across the organization" },
        ],
      },
      {
        title: "Controls",
        pages: [
          { title: "Team Management", href: "/ceo/team-management", icon: Users, description: "Access all team management functions" },
          { title: "Department Oversight", href: "/ceo/department-oversight", icon: Building2, description: "Access all department dashboards" },
          { title: "Performance Analytics", href: "/ceo/performance-analytics", icon: PieChart, description: "View comprehensive performance analytics" },
          { title: "Reports & Insights", href: "/ceo/reports", icon: FileBarChart, description: "Generate and view executive reports" },
        ],
      },
    ],
  },
  {
    title: "Admin",
    description: "System administration and configuration",
    pages: [
      { title: "User Management", href: "/admin/users", icon: Users, description: "Manage users and roles" },
      { title: "Permissions", href: "/admin/permissions", icon: Shield, description: "Manage permission matrix" },
      { title: "Credentials", href: "/admin/credentials", icon: Key, description: "Manage credentials for job portals and services" },
      { title: "System Settings", href: "/admin/settings", icon: Settings, description: "Configure system settings" },
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3, description: "View system analytics and reports" },
      { title: "Admin Tasks", href: "/admin/tasks", icon: CheckSquare, description: "Manage admin tasks" },
    ],
  },
  {
    title: "Development",
    description: "Development tools and resources",
    subsections: [
      {
        title: "Projects & Tasks",
        pages: [
          { title: "Projects", href: "/development/projects", icon: Briefcase, description: "Development projects and roadmap" },
          { title: "Tasks", href: "/development/tasks", icon: CheckSquare, description: "Development tasks and issues" },
        ],
      },
      {
        title: "Design System",
        pages: [
          { title: "Foundations", href: "/development/design-system/foundations", icon: Palette, description: "Design system foundations" },
          { title: "Components", href: "/development/design-system/components", icon: Code, description: "Component library" },
        ],
      },
      {
        title: "Resources",
        pages: [
          { title: "Stack", href: "/development/stack", icon: Grid3x3, description: "Technology stack" },
          { title: "Prompts", href: "/development/prompts", icon: Sparkles, description: "AI prompts library" },
          { title: "UI Libraries", href: "/development/ui-libraries", icon: Package, description: "Component libraries" },
          { title: "External Apps", href: "/development/external-apps", icon: ExternalLink, description: "Quick links to external tools" },
        ],
      },
      {
        title: "Documentation",
        pages: [
          { title: "Docs", href: "/development/docs", icon: BookOpen, description: "Project documentation" },
          { title: "Credentials", href: "/development/credentials", icon: Key, description: "Environment variables and setup" },
        ],
      },
    ],
  },
]

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useUser()

  // Redirect authenticated users based on role
  useEffect(() => {
    if (!isLoading && user) {
      // Redirect superadmin/CEO to /explore, others to /projects
      const redirectPath = user.role === 'superadmin' ? '/explore' : '/projects'
      router.push(redirectPath)
    }
  }, [user, isLoading, router])

  // Calculate total page count for each section
  const getPageCount = (section: typeof pageSections[0]) => {
    if (section.subsections) {
      return section.subsections.reduce((acc, sub) => acc + sub.pages.length, 0)
    }
    return section.pages.length
  }

  // Show sign-in prompt for unauthenticated users
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="w-full max-w-md mx-auto px-4">
          <Card className="bg-white border-0 shadow-none rounded-2xl">
            <CardContent className="p-8 space-y-6 text-center">
              <div className="flex flex-col gap-4 items-center">
                <div 
                  className="relative p-4 rounded-full"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(243, 242, 255, 0.48) 0%, rgba(243, 242, 255, 0) 100%)',
                    border: '1px solid #f3f2ff'
                  }}
                >
                  <div 
                    className="bg-white border border-[#dad7fd] rounded-full p-3.5 shadow-[0px_2px_4px_0px_rgba(179,212,253,0.04)] flex items-center justify-center"
                  >
                    <LogIn className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 items-center text-center">
                  <h1 
                    className="text-2xl font-semibold leading-[1.3] text-[#0d0d12]"
                    style={{ fontFamily: "var(--font-inter-tight)" }}
                  >
                    Welcome to Team Portal
                  </h1>
                  <p 
                    className="text-base leading-[1.5] text-[#666d80] tracking-[0.32px]"
                    style={{ fontFamily: "var(--font-inter-tight)" }}
                  >
                    Please sign in to access your workspace
                  </p>
                </div>
              </div>

              <Link href="/sign-in" className="block">
                <Button 
                  className="w-full h-[52px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base tracking-[0.32px] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]" 
                  style={{ fontFamily: "var(--font-inter-tight)" }}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight mb-1.5">HR Portal</h1>
          <p className="text-base text-muted-foreground">
            Quick access to all working pages and features
          </p>
        </div>

        {/* Page Sections with Accordion */}
        <Accordion type="single" collapsible defaultValue="my-workspace" className="space-y-3">
          {pageSections.map((section) => {
            const sectionKey = section.title.toLowerCase().replace(/\s+/g, "-")
            const pageCount = getPageCount(section)

            return (
              <AccordionItem
                key={section.title}
                value={sectionKey}
                className="border rounded-lg bg-card px-4"
              >
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="text-left">
                      <CardTitle className="text-base font-semibold tracking-tight">
                        {section.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {section.description} • {pageCount} {pageCount === 1 ? "page" : "pages"}
                      </CardDescription>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  {section.subsections ? (
                    <div className="space-y-4">
                      {section.subsections.map((subsection) => (
                        <div key={subsection.title} className="space-y-2.5">
                          <h3 className="text-sm font-semibold text-foreground px-1">
                            {subsection.title}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {subsection.pages.map((page) => (
                              <PageLinkTile
                                key={page.href}
                                title={page.title}
                                href={page.href}
                                icon={page.icon}
                                description={page.description}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {section.pages.map((page) => (
                        <PageLinkListItem
                          key={page.href}
                          title={page.title}
                          href={page.href}
                          icon={page.icon}
                          description={page.description}
                        />
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  )
}

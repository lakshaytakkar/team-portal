"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Calendar, CheckSquare, Briefcase, Clock, UserPlus, DollarSign, Settings, Headphones } from "lucide-react"

const auth = [
  {
    title: "Sign in",
    description: "Login form (frontend-only)",
    href: "/sign-in",
  },
  {
    title: "Sign up",
    description: "Registration form (frontend-only)",
    href: "/sign-up",
  },
]

const dashboard = [
  {
    title: "Dashboard",
    description: "Main dashboard overview",
    href: "/",
    icon: FileText,
  },
  {
    title: "Calendar",
    description: "Calendar view and scheduling",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "My Projects",
    description: "Project management and task tracking",
    href: "/projects",
    icon: Briefcase,
  },
  {
    title: "My Tasks",
    description: "Task management and tracking",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Employee",
    description: "Employee management",
    href: "/employee",
    icon: Users,
  },
  {
    title: "Attendance",
    description: "Employee attendance tracking and management",
    href: "/attendance",
    icon: Clock,
  },
  {
    title: "Recruitment",
    description: "Recruitment and hiring",
    href: "/recruitment",
    icon: UserPlus,
  },
  {
    title: "Payroll",
    description: "Payroll management",
    href: "/payroll",
    icon: DollarSign,
  },
  {
    title: "Invoices",
    description: "Invoice management",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "Settings",
    description: "Application settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help & Center",
    description: "Help and support center",
    href: "/help",
    icon: Headphones,
  },
]

export default function PagesIndexPage() {
  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-2">
        <h1 className="tracking-tighter">Pages Index</h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium">
          Comprehensive directory of all system routes and feature pages.
        </p>
      </div>

      <Card className="bg-secondary/20 border-border/40">
        <CardHeader className="bg-secondary/40 border-b border-border/40 py-6 px-8">
          <CardTitle className="text-xl font-bold tracking-tight">Identity & Access</CardTitle>
          <CardDescription className="font-medium">Authentication flows and security interfaces.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {auth.map((item) => (
              <Link key={item.href} href={item.href} className="block group">
                <Card className="h-full bg-background/50 border-border/40 hover:border-primary/50 transition-all group-hover:bg-background">
                  <CardHeader className="p-5">
                    <CardTitle className="text-base font-bold tracking-tight group-hover:text-primary transition-colors">{item.title}</CardTitle>
                    <CardDescription className="text-xs font-medium leading-relaxed">{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-secondary/20 border-border/40">
        <CardHeader className="bg-secondary/40 border-b border-border/40 py-6 px-8">
          <CardTitle className="text-xl font-bold tracking-tight">Application Modules</CardTitle>
          <CardDescription className="font-medium">Primary features and operational dashboards.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboard.map((item) => {
              const Icon = item.icon || FileText
              return (
                <Link key={item.href} href={item.href} className="block group">
                  <Card className="h-full bg-background/50 border-border/40 hover:border-primary/50 transition-all group-hover:bg-background">
                    <CardHeader className="p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary/10 p-1.5 rounded-lg">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-base font-bold tracking-tight group-hover:text-primary transition-colors">{item.title}</CardTitle>
                      </div>
                      <CardDescription className="text-xs font-medium leading-relaxed">{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


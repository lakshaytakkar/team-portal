"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Bell,
  ChevronDown,
  LogOut,
  Mail,
  Menu,
  MoreVertical,
  Phone,
  Search,
  Settings,
  User,
} from "lucide-react"

export default function CompositesPage() {
  const [selectedValue, setSelectedValue] = useState("dashboard")
  const people = [
    {
      name: "Robert Johnson",
      initials: "RJ",
      role: "Super Admin",
      department: "HR Management",
      status: { label: "Active", variant: "green" as const },
    },
    {
      name: "Sarah Miller",
      initials: "SM",
      role: "Recruiter",
      department: "Talent",
      status: { label: "On Leave", variant: "yellow" as const },
    },
    {
      name: "Alex Brown",
      initials: "AB",
      role: "Payroll",
      department: "Finance",
      status: { label: "Inactive", variant: "red" as const },
    },
  ]

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-6xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          Composites
        </h1>
        <p className="text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          The style guide provides to change stylistic for your design site.
        </p>
      </div>

      <Separator />

      {/* Sidebar Navigation */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Sidebar Navigation
          </h2>
        </div>

        <div className="flex gap-8">
          <Card className="w-64">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-white font-bold">L</span>
                </div>
                <CardTitle className="text-lg">LuminHR</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Main Menu</p>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start bg-primary/10 text-primary">
                    <Menu className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Menu className="h-4 w-4 mr-2" />
                    Projects
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Menu className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Management</p>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start">
                    Employee
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Attendance
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Recruitment
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Payroll
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Invoices
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Help & Center
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Toolbar */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Toolbar
          </h2>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Dashboard</h2>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-9" />
                </div>
                <Button variant="ghost" size="icon-sm" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>RJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Robert Johnson</p>
                    <p className="text-xs text-muted-foreground">Super Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Table Header */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Table Header
          </h2>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4">
                <Checkbox />
                <span className="text-sm font-medium">Table Header</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Table Row */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Table Row
          </h2>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4 flex-1">
                <Checkbox />
                <div className="flex-1">
                  <p className="text-sm font-medium">Title Name</p>
                  <p className="text-xs text-muted-foreground">Description</p>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">JD</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 -ml-2">
                    <AvatarFallback className="text-xs">SM</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 -ml-2">
                    <AvatarFallback className="text-xs">AB</AvatarFallback>
                  </Avatar>
                </div>
                <Badge variant="primary">Label</Badge>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon-sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Cards */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Cards
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Total Employee</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-green-600">👤</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">649</p>
              <p className="text-sm text-green-600 mt-2">+25.5% last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>PM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Full-view - 2 Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Website Redesign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="green">Completed</Badge>
              <p className="text-sm text-muted-foreground">5 tasks due soon</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>80%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-4/5" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">A</AvatarFallback>
                </Avatar>
                <Avatar className="h-6 w-6 -ml-2">
                  <AvatarFallback className="text-xs">B</AvatarFallback>
                </Avatar>
                <Avatar className="h-6 w-6 -ml-2">
                  <AvatarFallback className="text-xs">C</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Dropdown Menu */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Dropdown Menu
          </h2>
        </div>

        <Select value={selectedValue} onValueChange={setSelectedValue}>
          <SelectTrigger className="w-64">
            <div className="flex items-center gap-2">
              <Menu className="h-4 w-4 text-primary" />
              <SelectValue placeholder="Dashboard" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dashboard">
              <div className="flex items-center gap-2">
                <Menu className="h-4 w-4 text-primary" />
                Dashboard
              </div>
            </SelectItem>
            <SelectItem value="projects">Projects</SelectItem>
            <SelectItem value="calendar">Calendar</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <Separator />

      {/* Calendar View */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Calendar View
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Wed 28</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2 bg-primary/10 rounded border-l-2 border-primary">
                <p className="text-xs font-medium">Team Hall Meeting</p>
                <p className="text-xs text-muted-foreground">10:00 AM</p>
              </div>
              <div className="p-2 bg-green-100 rounded border-l-2 border-green-500">
                <p className="text-xs font-medium">Training Session</p>
                <p className="text-xs text-muted-foreground">2:00 PM</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Wed 29</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2 bg-primary/10 rounded border-l-2 border-primary">
                <p className="text-xs font-medium">Project Review</p>
                <p className="text-xs text-muted-foreground">11:00 AM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}


"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  FileDown,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Users,
  DollarSign,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"

// Mock data for payroll
const payrollData = [
  {
    id: 1,
    employee: {
      name: "John Doe",
      email: "johndoe@gmail.com",
      avatar: "john-doe",
    },
    department: "Design",
    date: "June 29, 2025",
    totalSalary: "$2.300,00",
    reimbursement: "$100,00",
    status: "paid",
  },
  {
    id: 2,
    employee: {
      name: "Emily Carter",
      email: "emily.c@example.com",
      avatar: "emily-carter",
    },
    department: "Engineering",
    date: "June 29, 2025",
    totalSalary: "$3.500,00",
    reimbursement: "$150,00",
    status: "pending",
  },
  {
    id: 3,
    employee: {
      name: "Michael Chen",
      email: "m.chen@workplace.net",
      avatar: "michael-chen",
    },
    department: "Marketing",
    date: "June 29, 2025",
    totalSalary: "$1.800,00",
    reimbursement: "$75,00",
    status: "paid",
  },
  {
    id: 4,
    employee: {
      name: "Sophia Rodriguez",
      email: "sophia.r@aol.com",
      avatar: "sophia-rodriguez",
    },
    department: "Sales",
    date: "June 29, 2025",
    totalSalary: "$5.200,00",
    reimbursement: "$250,00",
    status: "overdue",
  },
  {
    id: 5,
    employee: {
      name: "David Lee",
      email: "dlee@techcorp.io",
      avatar: "david-lee",
    },
    department: "Product",
    date: "June 29, 2025",
    totalSalary: "$4.100,00",
    reimbursement: "$180,00",
    status: "paid",
  },
  {
    id: 6,
    employee: {
      name: "Isabella Garcia",
      email: "isabella.g@me.com",
      avatar: "isabella-garcia",
    },
    department: "Human Resources",
    date: "June 29, 2025",
    totalSalary: "$2.900,00",
    reimbursement: "$120,00",
    status: "unpaid",
  },
  {
    id: 7,
    employee: {
      name: "James Wilson",
      email: "james.w@consulting.com",
      avatar: "james-wilson",
    },
    department: "Support",
    date: "June 29, 2025",
    totalSalary: "$1.550,00",
    reimbursement: "$65,00",
    status: "processing",
  },
  {
    id: 8,
    employee: {
      name: "Olivia Martinez",
      email: "olivia.m@startup.co",
      avatar: "olivia-martinez",
    },
    department: "Design",
    date: "June 29, 2025",
    totalSalary: "$3.100,00",
    reimbursement: "$130,00",
    status: "refunded",
  },
]

const statusConfig: Record<
  string,
  { label: string; borderColor: string; textColor: string; dotColor: string }
> = {
  paid: {
    label: "Paid",
    borderColor: "border-[#339d88]",
    textColor: "text-[#339d88]",
    dotColor: "bg-[#339d88]",
  },
  pending: {
    label: "Pending",
    borderColor: "border-[#f59e0b]",
    textColor: "text-[#f59e0b]",
    dotColor: "bg-[#f59e0b]",
  },
  overdue: {
    label: "Overdue",
    borderColor: "border-[#df1c41]",
    textColor: "text-[#df1c41]",
    dotColor: "bg-[#df1c41]",
  },
  unpaid: {
    label: "Unpaid",
    borderColor: "border-[#df1c41]",
    textColor: "text-[#df1c41]",
    dotColor: "bg-[#df1c41]",
  },
  processing: {
    label: "Processing",
    borderColor: "border-[#3b82f6]",
    textColor: "text-[#3b82f6]",
    dotColor: "bg-[#3b82f6]",
  },
  refunded: {
    label: "Refunded",
    borderColor: "border-[#df1c41]",
    textColor: "text-[#df1c41]",
    dotColor: "bg-[#df1c41]",
  },
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
}: {
  title: string
  value: string
  change: string
  changeLabel: string
  icon: React.ElementType
}) {
  return (
    <Card className="border border-border rounded-2xl p-[18px] bg-white">
      <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
        {title}
      </p>
      <div className="flex items-center justify-between mt-0.5">
        <div className="flex flex-col">
          <p className="text-xl font-semibold text-foreground leading-[1.35]">
            {value}
          </p>
          <div className="flex items-center gap-2 text-xs mt-0.5">
            <span className="text-[#10b981] font-medium">{change}</span>
            <span className="text-muted-foreground font-medium">{changeLabel}</span>
          </div>
        </div>
        <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  )
}

export default function FinancePayrollPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const toggleRowSelection = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    )
  }

  const toggleAllSelection = () => {
    if (selectedRows.length === payrollData.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(payrollData.map((item) => item.id))
    }
  }

  const filteredData = payrollData.filter(
    (item) =>
      item.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Payroll</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage employee payroll, salaries, and payments</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Payroll Cost"
          value="$15.248,00"
          change="+20,5%"
          changeLabel="to last month"
          icon={Users}
        />
        <StatCard
          title="Total Expense"
          value="$8.035,00"
          change="+25%"
          changeLabel="to last month"
          icon={DollarSign}
        />
        <StatCard
          title="Pending Payments"
          value="$6.492,00"
          change="+17,6%"
          changeLabel="to last month"
          icon={Clock}
        />
        <StatCard
          title="Total Payrolls"
          value="108"
          change="+5%"
          changeLabel="to last month"
          icon={FileText}
        />
      </div>

      {/* Table */}
      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-[38px]">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-[38px]">
              <ArrowUpDown className="h-5 w-5" />
              Sort by
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="default" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export
            </Button>
            <Button variant="default" size="default" className="gap-2">
              <Plus className="h-4 w-4" />
              New Payroll
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="w-[72px] px-3">
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      checked={selectedRows.length === payrollData.length}
                      onCheckedChange={toggleAllSelection}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-muted-foreground">No</span>
                  </div>
                </TableHead>
                <TableHead className="w-[200px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Employee Name</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Department</span>
                </TableHead>
                <TableHead className="w-[144px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Date</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Total Salary</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Reimbursement</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => {
                const status = statusConfig[item.status] || statusConfig.paid
                return (
                  <TableRow key={item.id} className="border-b border-border">
                    <TableCell className="px-3">
                      <div className="flex items-center gap-2.5">
                        <Checkbox
                          checked={selectedRows.includes(item.id)}
                          onCheckedChange={() => toggleRowSelection(item.id)}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-foreground">{index + 1}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 border-2 border-white">
                          <AvatarImage
                            src={getAvatarForUser(item.employee.avatar || item.employee.name)}
                            alt={item.employee.name}
                          />
                          <AvatarFallback className="text-xs bg-muted">
                            {item.employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium text-foreground">
                            {item.employee.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3">
                      <Badge variant="primary" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                        {item.department}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">{item.date}</span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">
                        {item.totalSalary}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">
                        {item.reimbursement}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-5 px-1.5 py-0.5 rounded-2xl text-xs gap-1 bg-background",
                          status.borderColor,
                          status.textColor
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", status.dotColor)} />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3">
                      <button className="w-4 h-4 flex items-center justify-center">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="border-t border-border px-5 py-4 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            Showing 1 to 10 of, 500 results
          </p>
          <div className="flex items-center gap-2">
            <div className="border border-border rounded-lg flex items-center h-8">
              <div className="border-r border-border px-2 py-2">
                <span className="text-xs font-medium text-foreground">Per page</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-2">
                <span className="text-xs font-semibold text-foreground">10</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-xsm" className="h-8 w-8">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="border border-border rounded-lg flex items-center h-8">
                <div className="border-r border-border px-2 py-2 h-8 w-8 flex items-center justify-center">
                  <span className="text-xs font-medium text-foreground">1</span>
                </div>
                <div className="border-r border-border px-2 py-2 h-8 w-8 flex items-center justify-center">
                  <span className="text-xs font-medium text-foreground">2</span>
                </div>
                <div className="bg-primary text-primary-foreground border-r border-border px-2 py-2 h-8 w-8 flex items-center justify-center">
                  <span className="text-xs font-semibold">3</span>
                </div>
                <div className="border-r border-border px-2 py-2 h-8 w-8 flex items-center justify-center">
                  <span className="text-xs font-medium text-foreground">...</span>
                </div>
                <div className="px-2 py-2 h-8 w-8 flex items-center justify-center">
                  <span className="text-xs font-medium text-foreground">5</span>
                </div>
              </div>
              <Button variant="outline" size="icon-xsm" className="h-8 w-8">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

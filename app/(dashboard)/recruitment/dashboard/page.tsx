"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  FileText,
  Search,
  Filter,
  MoreVertical,
  Signal,
  Plus,
  RefreshCw,
} from "lucide-react"
import {
  getRecruitmentDashboardMetrics,
  getJobPostings,
  getApplications,
} from "@/lib/actions/recruitment"
import { ErrorState } from "@/components/ui/error-state"
import { format } from "date-fns"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

async function fetchDashboardMetrics() {
  return await getRecruitmentDashboardMetrics()
}

async function fetchJobPostings() {
  return await getJobPostings()
}

async function fetchApplications() {
  return await getApplications()
}

const applicationsChartConfig = {
  thisPeriod: {
    label: "This period",
    color: "#301da4",
  },
  lastPeriod: {
    label: "Last period",
    color: "#a6ff00",
  },
} satisfies ChartConfig

export default function RecruitmentDashboardPage() {
  const router = useRouter()
  const [timePeriod, setTimePeriod] = useState("monthly")
  const [searchJobPosts, setSearchJobPosts] = useState("")
  const [searchApplications, setSearchApplications] = useState("")

  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ["recruitment-dashboard-metrics"],
    queryFn: fetchDashboardMetrics,
  })

  const { data: jobPostings } = useQuery({
    queryKey: ["recruitment-job-postings"],
    queryFn: fetchJobPostings,
  })

  const { data: applications } = useQuery({
    queryKey: ["recruitment-applications"],
    queryFn: fetchApplications,
  })

  if (metricsLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[427px] w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (metricsError) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="We couldn't load the recruitment dashboard. Please check your connection and try again."
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (!metrics) {
    return null
  }

  const recentJobPostings = jobPostings
    ?.slice(0, 3)
    .filter((p) =>
      p.title.toLowerCase().includes(searchJobPosts.toLowerCase())
    ) || []

  const recentApplicationsList = applications
    ?.slice(0, 3)
    .filter((a) =>
      a.candidateName.toLowerCase().includes(searchApplications.toLowerCase())
    ) || []

  const chartData = metrics.applicationsOverTime.map((item) => ({
    month: item.month,
    thisPeriod: item.thisPeriod,
    lastPeriod: item.lastPeriod,
  }))

  const totalApplications = metrics.applicationsOverTime.reduce(
    (sum, item) => sum + item.thisPeriod,
    0
  )
  const totalLastPeriod = metrics.applicationsOverTime.reduce(
    (sum, item) => sum + item.lastPeriod,
    0
  )
  const percentageChange =
    totalLastPeriod > 0
      ? ((totalApplications - totalLastPeriod) / totalLastPeriod) * 100
      : totalApplications > 0
      ? 100
      : 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Recruiter Dashboard</h1>
            <p className="text-xs text-white/90 mt-0.5">Overview of your job posts, applications, and hiring stats.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm">
            <Signal className="h-4 w-4 mr-2" />
            Report
          </Button>
          <Button size="sm" onClick={() => router.push("/recruitment/job-postings")}>
            <Plus className="h-4 w-4 mr-2" />
            Post Job
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="border border-border rounded-[12px] shadow-[0px_2px_4px_-1px_rgba(13,13,18,0.06)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white border border-border rounded-[10px] w-10 h-10 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground leading-[1.4]">
                  {metrics.activeJobPosts}
                </p>
                <p className="text-sm text-muted-foreground">Active Job Posts</p>
              </div>
              {metrics.activeJobPostsChange !== 0 && (
                <Badge
                  variant="outline"
                  className="bg-[#effefa] border-[rgba(221,243,239,0.48)] text-[#28806f] text-xs"
                >
                  {metrics.activeJobPostsChange > 0 ? "+" : ""}
                  {metrics.activeJobPostsChange} this week
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[12px] shadow-[0px_2px_4px_-1px_rgba(13,13,18,0.06)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white border border-border rounded-[10px] w-10 h-10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground leading-[1.4]">
                  {metrics.totalApplicants}
                </p>
                <p className="text-sm text-muted-foreground">Total Applicants</p>
              </div>
              {metrics.totalApplicantsChange !== 0 && (
                <Badge
                  variant="outline"
                  className="bg-[#effefa] border-[rgba(221,243,239,0.48)] text-[#28806f] text-xs"
                >
                  {metrics.totalApplicantsChange > 0 ? "+" : ""}
                  {metrics.totalApplicantsChange.toFixed(1)}% this month
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[12px] shadow-[0px_2px_4px_-1px_rgba(13,13,18,0.06)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white border border-border rounded-[10px] w-10 h-10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground leading-[1.4]">
                  {metrics.interviewsScheduled}
                </p>
                <p className="text-sm text-muted-foreground">Interviews Scheduled</p>
              </div>
              {metrics.interviewsScheduledChange !== 0 && (
                <Badge
                  variant="outline"
                  className="bg-[#effefa] border-[rgba(221,243,239,0.48)] text-[#28806f] text-xs"
                >
                  {metrics.interviewsScheduledChange > 0 ? "+" : ""}
                  {metrics.interviewsScheduledChange} this week
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[12px] shadow-[0px_2px_4px_-1px_rgba(13,13,18,0.06)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white border border-border rounded-[10px] w-10 h-10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground leading-[1.4]">
                  {metrics.hiresCompleted}
                </p>
                <p className="text-sm text-muted-foreground">Hires Completed</p>
              </div>
              {metrics.hiresCompletedChange !== 0 && (
                <Badge
                  variant="outline"
                  className="bg-[#effefa] border-[rgba(221,243,239,0.48)] text-[#28806f] text-xs"
                >
                  {metrics.hiresCompletedChange > 0 ? "+" : ""}
                  {metrics.hiresCompletedChange} this week
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border border-border rounded-[12px] shadow-[0px_2px_4px_-1px_rgba(13,13,18,0.06)]">
        <CardHeader className="border-b border-border h-16 flex items-center justify-between px-5 py-0">
          <h3 className="text-base font-semibold text-foreground">Applications Received Over Time</h3>
          <div className="flex gap-2">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold text-foreground leading-[1.3]">
                {totalApplications.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="text-[#40c4aa] font-semibold">
                  {percentageChange > 0 ? "+" : ""}
                  {percentageChange.toFixed(0)}%
                </span>
                {" from January to December"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-[#301da4]" />
                <span className="text-sm text-muted-foreground">This period</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-[#a6ff00]" />
                <span className="text-sm text-muted-foreground">Last period</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ChartContainer config={applicationsChartConfig} className="h-full">
              <LineChart data={chartData} margin={{ left: 0, right: 0, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe1e7" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "#666d80", fontSize: 14 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "#666d80", fontSize: 14 }}
                  domain={[0, "dataMax"]}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => [value.toString(), ""]}
                />
                <Line
                  type="monotone"
                  dataKey="thisPeriod"
                  stroke="#301da4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="lastPeriod"
                  stroke="#a6ff00"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Job Posts */}
        <Card className="border border-border rounded-[12px] shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)]">
          <CardHeader className="border-b border-border h-16 flex items-center justify-between px-5 py-2">
            <h3 className="text-base font-semibold text-foreground">Recent Job Posts</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={searchJobPosts}
                  onChange={(e) => setSearchJobPosts(e.target.value)}
                  className="h-8 w-64 pl-9 pr-3"
                />
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[176px]">
                    <div className="flex items-center gap-2.5">
                      <input type="checkbox" className="w-4 h-4 rounded border-border" />
                      <span className="text-sm font-medium text-muted-foreground">Job Title</span>
                    </div>
                  </TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Posted On</TableHead>
                  <TableHead className="w-[44px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentJobPostings.length > 0 ? (
                  recentJobPostings.map((posting) => (
                    <TableRow key={posting.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <input type="checkbox" className="w-4 h-4 rounded border-border" />
                          <Link
                            href={`/recruitment/job-postings/${posting.id}`}
                            className="text-sm font-medium text-foreground hover:underline"
                          >
                            {posting.title}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {posting.applications}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={posting.status === "published" ? "default" : "destructive"}
                          className={
                            posting.status === "published"
                              ? "bg-[#ecf9f7] text-[#267666] border-0"
                              : "bg-[#fce8ec] text-[#b21634] border-0"
                          }
                        >
                          {posting.status === "published" ? "Active" : "Closed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {posting.postedDate
                          ? format(new Date(posting.postedDate), "MMM d, yyyy")
                          : format(new Date(posting.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/recruitment/job-postings/${posting.id}`)}
                            >
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/recruitment/job-postings/${posting.id}`)}
                            >
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      No job posts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="border border-border rounded-[12px] shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)]">
          <CardHeader className="border-b border-border h-16 flex items-center justify-between px-5 py-2">
            <h3 className="text-base font-semibold text-foreground">Recent Applications</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={searchApplications}
                  onChange={(e) => setSearchApplications(e.target.value)}
                  className="h-8 w-64 pl-9 pr-3"
                />
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[176px]">
                    <div className="flex items-center gap-2.5">
                      <input type="checkbox" className="w-4 h-4 rounded border-border" />
                      <span className="text-sm font-medium text-muted-foreground">Candidate</span>
                    </div>
                  </TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Date Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[44px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentApplicationsList.length > 0 ? (
                  recentApplicationsList.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <input type="checkbox" className="w-4 h-4 rounded border-border" />
                          <Link
                            href={`/recruitment/applications/${application.id}`}
                            className="text-sm font-medium text-foreground hover:underline"
                          >
                            {application.candidateName}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {application.position}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {application.appliedDate
                          ? format(new Date(application.appliedDate), "MMM d, yyyy")
                          : format(new Date(application.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            application.status === "hired" || application.status === "offer"
                              ? "default"
                              : application.status === "rejected"
                              ? "destructive"
                              : "outline"
                          }
                          className={
                            application.status === "hired" || application.status === "offer"
                              ? "bg-[#ecf9f7] text-[#267666] border-0"
                              : application.status === "rejected"
                              ? "bg-[#fce8ec] text-[#b21634] border-0"
                              : ""
                          }
                        >
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/recruitment/applications/${application.id}`)}
                            >
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/recruitment/applications/${application.id}`)}
                            >
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      No applications found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

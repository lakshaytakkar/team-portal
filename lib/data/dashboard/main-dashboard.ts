export interface Activity {
  id: string
  type: "task" | "project" | "call"
  title: string
  assignee?: string
  status: string
  date: string
  href?: string
}

export interface TaskCompletionData {
  date: string
  completed: number
  pending: number
}

export interface ProjectStatusData {
  status: string
  count: number
  color: string
}

export const mainDashboardStats = {
  // Executive view
  myTasks: 24,
  myTasksChange: 8.2,
  myProjects: 5,
  myProjectsChange: 0,
  myCalls: 12,
  myCallsChange: 15.3,
  myAttendance: "Present",
  myAttendanceChange: 0,
  // Manager view
  teamTasks: 156,
  teamTasksChange: 12.5,
  teamProjects: 12,
  teamProjectsChange: 5.1,
  teamPerformance: 87.5,
  teamPerformanceChange: 4.1,
  activeTeamMembers: 24,
  activeTeamMembersChange: 8.2,
  // SuperAdmin view
  totalUsers: 142,
  totalUsersChange: 8.2,
  activeProjects: 28,
  activeProjectsChange: 5.1,
  systemHealth: 99.8,
  systemHealthChange: 0.2,
  totalTasks: 1245,
  totalTasksChange: 12.5,
}

export const taskCompletionData: TaskCompletionData[] = [
  { date: "Week 1", completed: 45, pending: 120 },
  { date: "Week 2", completed: 52, pending: 113 },
  { date: "Week 3", completed: 48, pending: 117 },
  { date: "Week 4", completed: 58, pending: 107 },
  { date: "Week 5", completed: 55, pending: 110 },
  { date: "Week 6", completed: 62, pending: 103 },
]

export const projectStatusData: ProjectStatusData[] = [
  { status: "Active", count: 18, color: "var(--chart-2)" },
  { status: "Completed", count: 8, color: "var(--chart-4)" },
  { status: "On Hold", count: 2, color: "var(--chart-3)" },
]

export const recentActivities: Activity[] = [
  {
    id: "1",
    type: "task",
    title: "Complete dashboard design",
    assignee: "Emily Carter",
    status: "In Progress",
    date: "2025-06-15",
  },
  {
    id: "2",
    type: "project",
    title: "Q2 Product Launch",
    assignee: "John Doe",
    status: "Active",
    date: "2025-06-14",
  },
  {
    id: "3",
    type: "call",
    title: "Follow-up with TechCorp",
    assignee: "Sarah Johnson",
    status: "Scheduled",
    date: "2025-06-16",
  },
  {
    id: "4",
    type: "task",
    title: "Review marketing materials",
    assignee: "Michael Chen",
    status: "Completed",
    date: "2025-06-13",
  },
]

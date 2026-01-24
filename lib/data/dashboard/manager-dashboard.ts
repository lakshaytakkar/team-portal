export interface TeamMember {
  id: string
  name: string
  role: string
  projects: number
  tasksCompleted: number
  productivity: number
  avatar?: string
}

export interface PerformanceData {
  date: string
  productivity: number
}

export interface TaskStatusData {
  status: string
  count: number
  color: string
}

export const managerDashboardStats = {
  teamSize: 24,
  teamSizeChange: 8.2,
  activeProjects: 12,
  activeProjectsChange: 5.1,
  tasksCompleted: 342,
  tasksCompletedChange: 12.5,
  teamProductivity: 87.5,
  teamProductivityChange: 4.1,
}

export const performanceData: PerformanceData[] = [
  { date: "Week 1", productivity: 82 },
  { date: "Week 2", productivity: 85 },
  { date: "Week 3", productivity: 88 },
  { date: "Week 4", productivity: 87 },
  { date: "Week 5", productivity: 89 },
  { date: "Week 6", productivity: 87.5 },
]

export const taskStatusData: TaskStatusData[] = [
  { status: "Completed", count: 342, color: "var(--chart-4)" },
  { status: "In Progress", count: 156, color: "var(--chart-2)" },
  { status: "Pending", count: 89, color: "var(--chart-3)" },
  { status: "Blocked", count: 12, color: "var(--chart-5)" },
]

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Emily Carter",
    role: "Product Manager",
    projects: 3,
    tasksCompleted: 45,
    productivity: 92,
  },
  {
    id: "2",
    name: "John Doe",
    role: "Backend Developer",
    projects: 4,
    tasksCompleted: 67,
    productivity: 88,
  },
  {
    id: "3",
    name: "Sarah Johnson",
    role: "Frontend Developer",
    projects: 2,
    tasksCompleted: 52,
    productivity: 91,
  },
  {
    id: "4",
    name: "Michael Chen",
    role: "UI/UX Designer",
    projects: 3,
    tasksCompleted: 38,
    productivity: 85,
  },
]

export interface HREmployee {
  id: string
  name: string
  employeeId: string
  department: string
  role: string
  joiningDate: string
  level: string
  avatar?: string
}

export interface WorkHoursData {
  date: string
  hours: number
}

export interface EmployeeTypeData {
  type: string
  count: number
  color: string
}

export const hrDashboardStats = {
  totalEmployees: 3540,
  totalEmployeesChange: 25.5,
  newEmployees: 500,
  newEmployeesChange: -5.1,
  resignedEmployees: 100,
  resignedEmployeesChange: 5.1,
  jobApplications: 1150,
  jobApplicationsChange: 4.1,
}

export const workHoursData: WorkHoursData[] = [
  { date: "2025-05-01", hours: 4.5 },
  { date: "2025-05-05", hours: 6.2 },
  { date: "2025-05-10", hours: 7.1 },
  { date: "2025-05-15", hours: 5.8 },
  { date: "2025-05-20", hours: 6.5 },
  { date: "2025-05-23", hours: 6.4 },
  { date: "2025-05-25", hours: 7.2 },
  { date: "2025-05-30", hours: 6.8 },
]

export const employeeTypeData: EmployeeTypeData[] = [
  { type: "Fulltime", count: 2100, color: "var(--chart-1)" },
  { type: "Freelance", count: 1000, color: "var(--chart-3)" },
  { type: "Internship", count: 440, color: "var(--chart-4)" },
]

export const hrEmployees: HREmployee[] = [
  {
    id: "1",
    name: "Emily Carter",
    employeeId: "6021147",
    department: "Product",
    role: "Product Manager",
    joiningDate: "September 15, 2025",
    level: "Part-Time",
  },
  {
    id: "2",
    name: "John Doe",
    employeeId: "1203814",
    department: "Developer",
    role: "Back End Dev",
    joiningDate: "July 16, 2025",
    level: "Internship",
  },
  {
    id: "3",
    name: "Sarah Johnson",
    employeeId: "3402567",
    department: "Sales",
    role: "Sales Manager",
    joiningDate: "March 10, 2025",
    level: "Full-Time",
  },
  {
    id: "4",
    name: "Michael Chen",
    employeeId: "4506789",
    department: "Marketing",
    role: "Marketing Specialist",
    joiningDate: "April 22, 2025",
    level: "Full-Time",
  },
  {
    id: "5",
    name: "Lisa Anderson",
    employeeId: "5601234",
    department: "HR",
    role: "HR Coordinator",
    joiningDate: "January 5, 2025",
    level: "Full-Time",
  },
]

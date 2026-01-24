import { Employee, Onboarding } from "@/lib/types/hr"

export const initialEmployees: Employee[] = [
  {
    id: "emp-1",
    employeeId: "EMP001",
    fullName: "John Doe",
    email: "john.doe@company.com",
    phone: "+1-555-2001",
    department: "Engineering",
    position: "Senior Developer",
    status: "active",
    roleType: "internal",
    hireDate: "2023-06-01",
    manager: {
      id: "user-2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
    },
    createdAt: "2023-06-01T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "emp-2",
    employeeId: "EMP002",
    fullName: "Jane Smith",
    email: "jane.smith@company.com",
    phone: "+1-555-2002",
    department: "Design",
    position: "UI/UX Designer",
    status: "active",
    roleType: "internal",
    hireDate: "2023-08-15",
    createdAt: "2023-08-15T00:00:00Z",
    updatedAt: "2024-01-19T00:00:00Z",
  },
  {
    id: "emp-3",
    employeeId: "EMP003",
    fullName: "Mike Johnson",
    email: "mike.johnson@company.com",
    phone: "+1-555-2003",
    department: "Sales",
    position: "Sales Manager",
    status: "active",
    roleType: "client_facing",
    hireDate: "2023-03-20",
    createdAt: "2023-03-20T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
  },
]

export const initialOnboardings: Onboarding[] = [
  {
    id: "onboard-1",
    employeeId: "EMP004",
    employeeName: "Alice Brown",
    status: "in-progress",
    startDate: "2024-01-15",
    assignedTo: {
      id: "user-2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
    },
    tasks: [
      {
        id: "task-1",
        title: "Complete employment forms",
        description: "Fill out W-4, I-9, and other required documents",
        completed: true,
        completedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "task-2",
        title: "Set up IT access",
        description: "Email, Slack, and system accounts",
        completed: true,
        completedAt: "2024-01-16T14:00:00Z",
      },
      {
        id: "task-3",
        title: "Equipment setup",
        description: "Laptop, monitor, and accessories",
        completed: false,
      },
      {
        id: "task-4",
        title: "Orientation meeting",
        description: "Meet with HR and team",
        completed: false,
      },
    ],
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
  },
]


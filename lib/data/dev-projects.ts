import { DevProjectData } from "@/lib/types/dev-project"

export const initialDevProjects: DevProjectData = {
  projects: [
    {
      id: "dev-proj-1",
      name: "Dev Portal Implementation",
      description: "Build comprehensive developer portal with Jira Lite functionality",
      status: "active",
      priority: "high",
      progress: 25,
      startDate: "2024-01-20",
      dueDate: "2024-02-15",
      linkedBusinessFeature: "Developer Tools",
      team: [
        {
          id: "dev-user-1",
          name: "Developer",
          email: "dev@example.com",
          role: "Full Stack Developer",
        },
      ],
      owner: {
        id: "dev-user-1",
        name: "Developer",
        email: "dev@example.com",
        role: "Full Stack Developer",
      },
      tasksCount: 15,
      completedTasksCount: 4,
      createdAt: "2024-01-20",
      updatedAt: "2024-01-20",
    },
    {
      id: "dev-proj-2",
      name: "HR Portal Core Features",
      description: "Implement core HR portal features: Dashboard, Projects, Tasks, Calls, Attendance",
      status: "active",
      priority: "high",
      progress: 40,
      startDate: "2024-01-01",
      dueDate: "2024-03-31",
      linkedBusinessFeature: "HR Management",
      team: [
        {
          id: "dev-user-1",
          name: "Developer",
          email: "dev@example.com",
          role: "Full Stack Developer",
        },
      ],
      owner: {
        id: "dev-user-1",
        name: "Developer",
        email: "dev@example.com",
        role: "Full Stack Developer",
      },
      tasksCount: 50,
      completedTasksCount: 20,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-20",
    },
  ],
}


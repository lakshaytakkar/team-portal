import { GoalData } from "@/lib/types/goal"

export const initialGoals: GoalData = {
  goals: [
    {
      id: "goal-1",
      title: "Complete Q1 Sales Target",
      description: "Achieve $500K in sales for Q1 2024",
      status: "in-progress",
      priority: "high",
      targetDate: "2024-03-31",
      progress: 65,
      assignedTo: {
        id: "user-1",
        name: "Robert Johnson",
        email: "robert@example.com",
      },
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-20T00:00:00Z",
    },
    {
      id: "goal-2",
      title: "Improve Customer Satisfaction Score",
      description: "Increase CSAT score from 4.2 to 4.5",
      status: "in-progress",
      priority: "medium",
      targetDate: "2024-06-30",
      progress: 40,
      assignedTo: {
        id: "user-1",
        name: "Robert Johnson",
        email: "robert@example.com",
      },
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-01-20T00:00:00Z",
    },
    {
      id: "goal-3",
      title: "Launch New Product Feature",
      description: "Complete development and launch of feature X",
      status: "not-started",
      priority: "high",
      targetDate: "2024-04-15",
      progress: 0,
      assignedTo: {
        id: "user-1",
        name: "Robert Johnson",
        email: "robert@example.com",
      },
      createdAt: "2024-01-10T00:00:00Z",
      updatedAt: "2024-01-10T00:00:00Z",
    },
  ],
}


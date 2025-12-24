export interface ExternalApp {
  name: string
  description: string
  url: string
  category: "design" | "database" | "deployment" | "version-control" | "project-management" | "other"
  logo?: string
}

export const externalApps: ExternalApp[] = [
  {
    name: "Figma",
    description: "Design and prototyping tool",
    url: "https://figma.com",
    category: "design",
    logo: "/logos/figma.svg",
  },
  {
    name: "Supabase",
    description: "Database and backend platform",
    url: "https://supabase.com/dashboard",
    category: "database",
  },
  {
    name: "Vercel",
    description: "Deployment platform",
    url: "https://vercel.com/dashboard",
    category: "deployment",
  },
  {
    name: "GitHub",
    description: "Version control and code hosting",
    url: "https://github.com", // Update with actual repo URL
    category: "version-control",
  },
  {
    name: "Linear",
    description: "Issue tracking and project management",
    url: "https://linear.app", // Update if using Linear
    category: "project-management",
  },
]


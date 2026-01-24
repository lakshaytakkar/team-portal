import {
  ResearchDoc,
  Mindmap,
  FinancialPlanning,
  NewVertical,
  Suggestion,
  StrategicPlanning,
  MarketResearch,
} from "@/lib/types/rnd"

export const initialResearchDocs: ResearchDoc[] = [
  {
    id: "rd-1",
    title: "AI Market Analysis 2024",
    description: "Comprehensive analysis of AI market trends",
    category: "Technology",
    status: "published",
    tags: ["AI", "Market Research", "2024"],
    createdBy: {
      id: "user-1",
      name: "Robert Johnson",
      email: "robert@example.com",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
]

export const initialMindmaps: Mindmap[] = [
  {
    id: "mm-1",
    title: "Product Strategy 2024",
    description: "Visual roadmap for product development",
    category: "Strategy",
    createdBy: {
      id: "user-1",
      name: "Robert Johnson",
      email: "robert@example.com",
    },
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
]

export const initialFinancialPlanning: FinancialPlanning[] = [
  {
    id: "fp-1",
    title: "E-commerce Vertical Budget",
    description: "Financial planning for new e-commerce vertical",
    vertical: "E-commerce",
    budget: 500000,
    status: "review",
    createdBy: {
      id: "user-1",
      name: "Robert Johnson",
      email: "robert@example.com",
    },
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
  },
]

export const initialNewVerticals: NewVertical[] = [
  {
    id: "nv-1",
    title: "Healthcare Technology",
    description: "Exploring opportunities in healthcare tech",
    marketSize: 50000000,
    status: "draft",
    createdBy: {
      id: "user-1",
      name: "Robert Johnson",
      email: "robert@example.com",
    },
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
]

export const initialSuggestions: Suggestion[] = [
  {
    id: "sug-1",
    title: "Implement dark mode",
    description: "Add dark mode theme option for better user experience",
    category: "UI/UX",
    priority: "medium",
    status: "open",
    createdBy: {
      id: "user-2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
    },
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
]

export const initialStrategicPlanning: StrategicPlanning[] = [
  {
    id: "sp-1",
    title: "International Expansion",
    description: "Strategic plan for international market entry",
    initiative: "Global Expansion",
    status: "review",
    createdBy: {
      id: "user-1",
      name: "Robert Johnson",
      email: "robert@example.com",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
]

export const initialMarketResearch: MarketResearch[] = [
  {
    id: "mr-1",
    title: "SaaS Market Trends",
    description: "Analysis of SaaS market trends and opportunities",
    market: "SaaS",
    status: "published",
    createdBy: {
      id: "user-1",
      name: "Robert Johnson",
      email: "robert@example.com",
    },
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
]


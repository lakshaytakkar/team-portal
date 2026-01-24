import {
  EmailTemplate,
  WhatsAppTemplate,
  EmailAutomation,
  WhatsAppAutomation,
  Drip,
  Campaign,
  AutomationLog,
  Page,
} from "@/lib/types/marketing"

export const initialEmailTemplates: EmailTemplate[] = [
  {
    id: "et-1",
    name: "Welcome Email",
    subject: "Welcome to Our Platform!",
    type: "email",
    status: "active",
    preview: "Thank you for joining us...",
    createdBy: {
      id: "user-5",
      name: "Jessica Martinez",
      email: "jessica@example.com",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "et-2",
    name: "Product Update",
    subject: "New Features Available",
    type: "email",
    status: "active",
    preview: "We're excited to announce new features...",
    createdBy: {
      id: "user-5",
      name: "Jessica Martinez",
      email: "jessica@example.com",
    },
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
]

export const initialWhatsAppTemplates: WhatsAppTemplate[] = [
  {
    id: "wt-1",
    name: "Welcome Message",
    message: "Hi! Welcome to our platform. We're here to help!",
    type: "whatsapp",
    status: "active",
    createdBy: {
      id: "user-5",
      name: "Jessica Martinez",
      email: "jessica@example.com",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

export const initialEmailAutomations: EmailAutomation[] = [
  {
    id: "ea-1",
    name: "New Lead Welcome",
    trigger: "lead_created",
    template: "et-1",
    status: "active",
    recipients: 150,
    sent: 150,
    opened: 120,
    clicked: 45,
    createdBy: {
      id: "user-5",
      name: "Jessica Martinez",
      email: "jessica@example.com",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
]

export const initialWhatsAppAutomations: WhatsAppAutomation[] = [
  {
    id: "wa-1",
    name: "Lead Follow-up",
    trigger: "lead_contacted",
    template: "wt-1",
    status: "active",
    recipients: 75,
    sent: 75,
    delivered: 73,
    read: 60,
    createdBy: {
      id: "user-5",
      name: "Jessica Martinez",
      email: "jessica@example.com",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
]

export const initialDrips: Drip[] = [
  {
    id: "drip-1",
    name: "Onboarding Sequence",
    description: "5-email sequence for new users",
    status: "active",
    steps: 5,
    recipients: 200,
    createdBy: {
      id: "user-5",
      name: "Jessica Martinez",
      email: "jessica@example.com",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
  },
]

export const initialCampaigns: Campaign[] = [
  {
    id: "campaign-1",
    name: "Q1 Product Launch",
    description: "Multi-channel campaign for new product launch",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    channels: ["email", "whatsapp"],
    recipients: 5000,
    sent: 4800,
    opened: 3600,
    clicked: 900,
    createdBy: {
      id: "user-5",
      name: "Jessica Martinez",
      email: "jessica@example.com",
    },
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
]

export const initialAutomationLogs: AutomationLog[] = [
  {
    id: "alog-1",
    type: "email",
    recipient: "user@example.com",
    subject: "Welcome to Our Platform!",
    status: "opened",
    sentAt: "2024-01-15T10:00:00Z",
    deliveredAt: "2024-01-15T10:00:01Z",
    openedAt: "2024-01-15T14:30:00Z",
    campaign: "campaign-1",
    createdAt: "2024-01-15T10:00:00Z",
  },
]

export const initialPages: Page[] = [
  {
    id: "page-1",
    title: "Homepage",
    slug: "home",
    status: "published",
    publishedAt: "2024-01-01",
    views: 12500,
    createdBy: {
      id: "user-5",
      name: "Jessica Martinez",
      email: "jessica@example.com",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
]


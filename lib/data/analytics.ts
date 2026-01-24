import {
  WebsiteTraffic,
  Conversion,
  ClientReport,
  Domain,
} from "@/lib/types/analytics"

export const initialWebsiteTraffic: WebsiteTraffic[] = [
  {
    id: "traffic-1",
    website: "example.com",
    date: "2024-01-20",
    visitors: 1250,
    pageViews: 3420,
    sessions: 1380,
    bounceRate: 32.5,
    avgSessionDuration: 245,
    createdAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "traffic-2",
    website: "example.com",
    date: "2024-01-19",
    visitors: 1180,
    pageViews: 3100,
    sessions: 1250,
    bounceRate: 35.2,
    avgSessionDuration: 220,
    createdAt: "2024-01-19T00:00:00Z",
  },
]

export const initialConversions: Conversion[] = [
  {
    id: "conv-1",
    website: "example.com",
    event: "form_submission",
    value: 5000,
    occurredAt: "2024-01-20T14:30:00Z",
    source: "google",
    createdAt: "2024-01-20T14:30:00Z",
  },
]

export const initialClientReports: ClientReport[] = [
  {
    id: "report-1",
    clientName: "Acme Corporation",
    reportType: "monthly",
    period: "2024-01",
    status: "published",
    generatedAt: "2024-02-01T00:00:00Z",
    generatedBy: {
      id: "user-5",
      name: "Jessica Martinez",
      email: "jessica@example.com",
    },
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
]

export const initialDomains: Domain[] = [
  {
    id: "domain-1",
    domain: "example.com",
    status: "active",
    expiryDate: "2025-12-31",
    registrar: "Registrar Inc",
    nameservers: ["ns1.example.com", "ns2.example.com"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]


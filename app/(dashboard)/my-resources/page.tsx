"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ExternalLink,
  Figma,
  Database,
  Rocket,
  GitBranch,
  FolderKanban,
  Key,
  Lock,
  CheckCircle2,
  XCircle,
} from "lucide-react"

const categoryIcons = {
  design: Figma,
  database: Database,
  deployment: Rocket,
  "version-control": GitBranch,
  "project-management": FolderKanban,
  other: ExternalLink,
}

// Placeholder external apps for user
const userExternalApps = [
  {
    name: "Google Sheets",
    description: "Spreadsheets and data management",
    url: "https://sheets.google.com",
    category: "other" as const,
  },
  {
    name: "Figma",
    description: "Design and prototyping tool",
    url: "https://figma.com",
    category: "design" as const,
  },
  {
    name: "Slack",
    description: "Team communication",
    url: "https://slack.com",
    category: "other" as const,
  },
  {
    name: "GitHub",
    description: "Version control and code hosting",
    url: "https://github.com",
    category: "version-control" as const,
  },
]

export default function MyResourcesPage() {
  const [activeTab, setActiveTab] = useState("apps")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#0d0d12] leading-[1.35]">My Resources</h1>
        <p className="text-sm text-[#666d80] mt-1">
          Access external apps, credentials, and integrations
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#F6F8FA] p-0.5 rounded-xl h-auto border-0">
          <TabsTrigger
            value="apps"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-[#0D0D12] data-[state=inactive]:text-[#666D80] data-[state=inactive]:font-medium"
          >
            External Apps
          </TabsTrigger>
          <TabsTrigger
            value="credentials"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-[#0D0D12] data-[state=inactive]:text-[#666D80] data-[state=inactive]:font-medium"
          >
            My Credentials
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-[#0D0D12] data-[state=inactive]:text-[#666D80] data-[state=inactive]:font-medium"
          >
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="mt-6">
          {/* External Apps Tab */}
          <TabsContent value="apps" className="mt-0">
            <Card className="border border-[#DFE1E7] rounded-2xl">
              <CardHeader>
                <CardTitle>External Apps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {userExternalApps.map((app) => {
                    const Icon = categoryIcons[app.category] || ExternalLink
                    return (
                      <Card
                        key={app.name}
                        className="border border-[#DFE1E7] rounded-2xl hover:border-[#897EFA] transition-colors"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="bg-[#F3F2FF] p-3 rounded-lg flex-shrink-0">
                              <Icon className="h-6 w-6 text-[#897EFA]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base text-[#0D0D12] mb-1">
                                {app.name}
                              </h3>
                              <p className="text-sm text-[#666D80] mb-3">{app.description}</p>
                              <a
                                href={app.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-[#897EFA] hover:text-[#897EFA]/80 flex items-center gap-1"
                              >
                                Launch <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Credentials Tab */}
          <TabsContent value="credentials" className="mt-0">
            <Card className="border border-[#DFE1E7] rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Credentials</CardTitle>
                <Button className="h-9 px-4 bg-[#897EFA] text-white rounded-lg hover:bg-[#897EFA]/90">
                  <Key className="h-4 w-4 mr-2" />
                  Add Credential
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-[#666d80]">
                        <div className="flex flex-col items-center justify-center py-12">
                          <Lock className="h-8 w-8 text-[#666d80] mb-3 opacity-50" />
                          <p className="text-base font-medium text-[#666d80] mb-2">No credentials stored</p>
                          <p className="text-sm text-[#666d80]">
                            Securely store your API keys, passwords, and access tokens here.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="mt-0">
            <Card className="border border-[#DFE1E7] rounded-2xl">
              <CardHeader>
                <CardTitle>Connected Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-[#F3F2FF] p-4 rounded-full mb-4">
                      <ExternalLink className="h-8 w-8 text-[#897EFA]" />
                    </div>
                    <p className="text-base font-medium text-[#666d80] mb-2">No integrations connected</p>
                    <p className="text-sm text-[#666d80] mb-4">
                      Connect your accounts to sync data and streamline workflows.
                    </p>
                    <Button className="bg-[#897EFA] text-white rounded-lg hover:bg-[#897EFA]/90">
                      Connect Integration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}


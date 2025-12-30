"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, Mail, FileCheck, Shield, Printer, Search, Eye, FileText } from "lucide-react"
import { CreateTemplateDialog } from "@/components/hr/CreateTemplateDrawer"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { getHRTemplates } from "@/lib/actions/hr"
import type { HRTemplate } from "@/lib/types/hr"
import type { HRTemplateType } from "@/lib/types/hr"

async function fetchTemplates(tab: string) {
  // Map tab values to database type values
  const typeMap: Record<string, HRTemplate['type']> = {
    'message': 'message',
    'forms': 'form',
    'policies': 'policy',
    'printables': 'printable',
  }
  const type = typeMap[tab] || undefined
  return await getHRTemplates(type)
}

export default function TemplatesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("message")
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: templates, isLoading, error, refetch } = useQuery({
    queryKey: ["hr-templates", activeTab],
    queryFn: () => fetchTemplates(activeTab),
  })

  const filteredTemplates = useMemo(() => {
    if (!templates) return []
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [templates, searchQuery])

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "message":
        return Mail
      case "forms":
        return FileCheck
      case "policies":
        return Shield
      case "printables":
        return Printer
      default:
        return FileText
    }
  }

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "message":
        return "Message Templates"
      case "forms":
        return "Form Templates"
      case "policies":
        return "Policy Templates"
      case "printables":
        return "Printables"
      default:
        return "Templates"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Templates</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage HR templates, forms, policies, and printables</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted p-0.5 rounded-xl h-auto border-0">
          <TabsTrigger
            value="message"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            Message Templates
          </TabsTrigger>
          <TabsTrigger
            value="forms"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            Form Templates
          </TabsTrigger>
          <TabsTrigger
            value="policies"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            Policy Templates
          </TabsTrigger>
          <TabsTrigger
            value="printables"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            Printables
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {(["message", "forms", "policies", "printables"] as const).map((tab) => {
            const TabIcon = getTabIcon(tab)
            const isActive = activeTab === tab

            return (
              <TabsContent key={tab} value={tab} className="mt-0">
                <Card className="border border-border rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{getTabLabel(tab)}</CardTitle>
                    <Button onClick={() => setIsCreateTemplateOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : error ? (
                      <ErrorState
                        title="Failed to load templates"
                        message="We couldn't load templates. Please check your connection and try again."
                        onRetry={() => refetch()}
                      />
                    ) : filteredTemplates.length === 0 ? (
                      <EmptyState
                        icon={TabIcon}
                        title={`No ${getTabLabel(tab).toLowerCase()} yet`}
                        description={`Create your first ${getTabLabel(tab).toLowerCase()} to get started.`}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredTemplates.map((template) => (
                                <TableRow key={template.id}>
                                  <TableCell className="font-medium">
                                    <Link
                                      href={`/hr/templates/${template.id}`}
                                      className="text-primary hover:text-primary/80 hover:underline"
                                    >
                                      {template.name}
                                    </Link>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="secondary">{template.category}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={template.isActive ? "default" : "outline"}
                                    >
                                      {template.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => router.push(`/hr/templates/${template.id}`)}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </div>
      </Tabs>
      
      <CreateTemplateDialog
        open={isCreateTemplateOpen}
        onOpenChange={setIsCreateTemplateOpen}
        defaultType={
          activeTab === 'forms' ? 'form' :
          activeTab === 'policies' ? 'policy' :
          activeTab === 'printables' ? 'printable' :
          'message'
        }
      />
    </div>
  )
}


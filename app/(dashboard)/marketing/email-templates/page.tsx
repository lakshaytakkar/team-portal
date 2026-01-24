"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  FileDown,
  Search,
  Filter,
  Mail,
  MoreVertical,
  Eye,
  Edit,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { EmailTemplate } from "@/lib/types/marketing"
import { initialEmailTemplates } from "@/lib/data/marketing"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CreateEmailTemplateDialog } from "@/components/marketing/CreateEmailTemplateDialog"
import { getAvatarForUser } from "@/lib/utils/avatars"

async function fetchEmailTemplates() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialEmailTemplates
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  active: { label: "Active", variant: "default" },
  archived: { label: "Archived", variant: "secondary" },
}

export default function MarketingEmailTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateEmailTemplateOpen, setIsCreateEmailTemplateOpen] = useState(false)
  const { data: templates, isLoading, error, refetch } = useQuery({
    queryKey: ["email-templates"],
    queryFn: fetchEmailTemplates,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border border-border rounded-[14px]">
              <CardContent className="p-5">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load email templates"
        message="We couldn't load email templates. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredTemplates = templates?.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Email Templates</h1>
            <p className="text-xs text-white/90 mt-0.5">Create and manage reusable email templates</p>
          </div>
        </div>
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-[38px]">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="default" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setIsCreateEmailTemplateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Email Template
            </Button>
          </div>
        </div>

        <div className="p-5">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTemplates.map((template) => {
                const status = statusConfig[template.status] || statusConfig.draft
                return (
                  <Card key={template.id} className="border border-border rounded-2xl hover:border-primary transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Mail className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-base text-foreground leading-6 tracking-[0.32px]">
                              {template.name}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {template.subject}
                          </p>
                          {template.preview && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                              {template.preview}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                            {status.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(template.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <RowActionsMenu
                          entityType="email-template"
                          entityId={template.id}
                          entityName={template.name}
                          canView={true}
                          canEdit={true}
                          canDelete={false}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={Mail}
              title="No email templates yet"
              description="Create your first email template to get started."
              action={{
                label: "Create Template",
                onClick: () => setIsCreateEmailTemplateOpen(true),
              }}
            />
          )}
        </div>
      </Card>

      <CreateEmailTemplateDialog open={isCreateEmailTemplateOpen} onOpenChange={setIsCreateEmailTemplateOpen} />
    </div>
  )
}

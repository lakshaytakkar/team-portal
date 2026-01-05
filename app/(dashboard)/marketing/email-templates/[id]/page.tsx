"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mail,
  Calendar,
  ArrowLeft,
  Edit,
  Eye,
  FileText,
} from "lucide-react"
import { EmailTemplate, TemplateStatus } from "@/lib/types/marketing"
import { getEmailTemplate, getEmailTemplates } from "@/lib/actions/marketing"
import { ErrorState } from "@/components/ui/error-state"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"

const statusConfig: Record<
  TemplateStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "Draft", variant: "outline" },
  active: { label: "Active", variant: "default" },
  archived: { label: "Archived", variant: "secondary" },
}

async function fetchEmailTemplate(id: string) {
  const template = await getEmailTemplate(id)
  if (!template) throw new Error("Email template not found")
  return template
}

async function fetchAllEmailTemplates() {
  return await getEmailTemplates()
}

export default function EmailTemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string

  const { data: template, isLoading, error, refetch } = useQuery({
    queryKey: ["email-template", templateId],
    queryFn: () => fetchEmailTemplate(templateId),
  })

  const { data: allTemplates } = useQuery({
    queryKey: ["all-email-templates"],
    queryFn: fetchAllEmailTemplates,
  })

  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !template) {
      notFound()
    }
  }, [error, isLoading, template])

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error && (!(error instanceof Error) || !error.message.toLowerCase().includes("not found"))) {
    return (
      <ErrorState
        title="Failed to load email template"
        message="We couldn't load this email template. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!template) {
    return null
  }

  const status = statusConfig[template.status]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/marketing/email-templates")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">{template.name}</h1>
              <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{template.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-5">
          <Card className="border border-border rounded-[14px]">
            <Tabs defaultValue="content">
              <div className="border-b border-border px-6 pt-4">
                <TabsList className="bg-muted p-0.5 rounded-xl w-full">
                  <TabsTrigger value="content" className="flex-1">
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex-1">
                    Preview
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="content" className="px-6 py-4 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Template Name</Label>
                    <p className="text-sm text-muted-foreground">{template.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Subject
                    </Label>
                    <p className="text-sm text-muted-foreground">{template.subject}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Content</Label>
                    <div className="border rounded-lg p-4 bg-muted/50 min-h-[300px]">
                      <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
                        {template.content || 'No content available'}
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="px-6 py-4">
                <div className="border rounded-lg p-4 bg-white min-h-[400px]">
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <p className="text-sm font-semibold text-foreground">{template.subject}</p>
                    </div>
                    <div className="prose max-w-none">
                      {template.content ? (
                        <div dangerouslySetInnerHTML={{ __html: template.content }} />
                      ) : (
                        <p className="text-sm text-muted-foreground">No preview available</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Created By
                </Label>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={template.createdBy.avatar} />
                    <AvatarFallback>{getAvatarForUser(template.createdBy.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{template.createdBy.name}</p>
                    <p className="text-xs text-muted-foreground">{template.createdBy.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Information
                </Label>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="text-foreground font-medium">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="text-foreground font-medium">
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}





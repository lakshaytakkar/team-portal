"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Copy,
  Mail,
  FileCheck,
  Shield,
  Printer,
  MessageSquare,
} from "lucide-react"
import { getHRTemplateById, updateHRTemplate, deleteHRTemplate } from "@/lib/actions/hr"
import type { HRTemplate } from "@/lib/types/hr"
import { ErrorState } from "@/components/ui/error-state"
import { toast } from "@/components/ui/sonner"
import { formatWhatsAppTemplate, formatEmailTemplate, formatTemplateContent } from "@/lib/utils/template-formatting"

async function fetchTemplate(id: string) {
  const template = await getHRTemplateById(id)
  if (!template) throw new Error("Template not found")
  return template
}

const typeConfig: Record<HRTemplate['type'], { label: string; icon: typeof Mail; color: string }> = {
  message: { label: "Message", icon: Mail, color: "bg-blue-500" },
  form: { label: "Form", icon: FileCheck, color: "bg-green-500" },
  policy: { label: "Policy", icon: Shield, color: "bg-purple-500" },
  printable: { label: "Printable", icon: Printer, color: "bg-orange-500" },
}

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string
  const queryClient = useQueryClient()
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedData, setEditedData] = useState<Partial<HRTemplate>>({})

  const { data: template, isLoading, error, refetch } = useQuery({
    queryKey: ["hr-template", templateId],
    queryFn: () => fetchTemplate(templateId),
  })

  const updateMutation = useMutation({
    mutationFn: updateHRTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-template", templateId] })
      queryClient.invalidateQueries({ queryKey: ["hr-templates"] })
      setIsEditMode(false)
      toast.success("Template updated successfully")
    },
    onError: (error: Error) => {
      toast.error("Failed to update template", {
        description: error.message,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteHRTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-templates"] })
      toast.success("Template deleted successfully")
      router.push("/hr/templates")
    },
    onError: (error: Error) => {
      toast.error("Failed to delete template", {
        description: error.message,
      })
    },
  })

  useEffect(() => {
    if (error && error instanceof Error && error.message.includes("not found")) {
      notFound()
    }
  }, [error])

  useEffect(() => {
    if (template) {
      setEditedData({
        name: template.name,
        type: template.type,
        category: template.category,
        description: template.description,
        content: template.content,
        channel: template.channel,
      })
    }
  }, [template])

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !template) {
    return (
      <ErrorState
        title="Template not found"
        message="The template you're looking for doesn't exist or has been deleted."
        onRetry={() => refetch()}
      />
    )
  }

  const typeInfo = typeConfig[template.type]
  const TypeIcon = typeInfo.icon
  const displayData = isEditMode ? editedData : template

  const handleSave = () => {
    if (!editedData.name || !editedData.content) {
      toast.error("Name and content are required")
      return
    }
    if (template.type === 'message' && !editedData.channel) {
      toast.error("Channel is required for message templates")
      return
    }
    updateMutation.mutate({
      id: template.id,
      ...editedData,
    })
  }

  const handleCancel = () => {
    setEditedData({
      name: template.name,
      type: template.type,
      category: template.category,
      description: template.description,
      content: template.content,
      channel: template.channel,
    })
    setIsEditMode(false)
  }

  const handleCopy = () => {
    const contentToCopy = template.content
    navigator.clipboard.writeText(contentToCopy)
    toast.success("Template content copied to clipboard")
  }

  const getFormattedContent = () => {
    if (template.type === 'message' && template.channel === 'whatsapp') {
      return formatWhatsAppTemplate(template.content)
    } else if (template.type === 'message' && template.channel === 'email') {
      return formatEmailTemplate(template.content)
    }
    return formatTemplateContent(template.content)
  }

  const isMessageTemplate = template.type === 'message'
  const hasChannel = template.channel !== undefined


  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/hr/templates")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              {isEditMode ? (
                <Input
                  value={displayData.name || ""}
                  onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                  className="text-xl font-semibold h-8 w-96"
                />
              ) : (
                <h1 className="text-xl font-semibold text-foreground leading-[1.35]">{template.name}</h1>
              )}
              <Badge variant="secondary" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeInfo.label}
              </Badge>
              {isMessageTemplate && hasChannel && (
                <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                  {template.channel === 'whatsapp' ? (
                    <MessageSquare className="h-3 w-3 mr-1" />
                  ) : (
                    <Mail className="h-3 w-3 mr-1" />
                  )}
                  {template.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                </Badge>
              )}
              <Badge
                variant={template.isActive ? "default" : "outline"}
                className="h-5 px-2 py-0.5 rounded-2xl text-xs"
              >
                {template.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {template.category} • Created {new Date(template.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={() => setIsEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-6">
          <div className="space-y-4">
              {isEditMode ? (
                <>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={displayData.description || ""}
                      onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                      className="min-h-[100px]"
                      placeholder="Enter description (optional)"
                    />
                  </div>
                  {isMessageTemplate && (
                    <div className="space-y-2">
                      <Label>Channel *</Label>
                      <Select
                        value={editedData.channel || 'email'}
                        onValueChange={(value) => setEditedData({ ...editedData, channel: value as 'whatsapp' | 'email' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Content *</Label>
                    <Textarea
                      value={displayData.content || ""}
                      onChange={(e) => setEditedData({ ...editedData, content: e.target.value })}
                      className="min-h-[400px] font-mono text-sm"
                      placeholder="Enter template content"
                    />
                  </div>
                </>
              ) : (
                <>
                  {template.description && (
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Description</Label>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Content</Label>
                    <div className="border rounded-lg p-4 bg-muted/50 min-h-[300px]">
                      <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
                        {getFormattedContent()}
                      </pre>
                    </div>
                  </div>
                </>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

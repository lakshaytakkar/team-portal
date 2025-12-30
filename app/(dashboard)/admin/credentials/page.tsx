"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Key,
  Plus,
  Search,
  Copy,
  Eye,
  EyeOff,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink,
  Clock,
  AlertTriangle,
  Briefcase,
  Share2,
  Mail,
  Users,
  DollarSign,
  Cloud,
  Code,
  HelpCircle,
  Lock,
  CheckCircle2,
} from "lucide-react"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import {
  getCredentialsByCategory,
  getCredentialCategories,
  createCredential,
  updateCredential,
  deleteCredential,
  getCredentialSecret,
} from "@/lib/actions/credentials"
import type {
  MaskedCredential,
  CredentialCategory,
  CredentialType,
  CredentialAccessLevel,
  CreateCredentialInput,
} from "@/lib/types/credentials"

const iconMap: Record<string, React.ElementType> = {
  Briefcase,
  Share2,
  Mail,
  Users,
  DollarSign,
  Cloud,
  Code,
  Key,
  HelpCircle,
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  green: "bg-green-100 text-green-700 border-green-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  sky: "bg-sky-100 text-sky-700 border-sky-200",
  violet: "bg-violet-100 text-violet-700 border-violet-200",
  gray: "bg-gray-100 text-gray-700 border-gray-200",
}

const credentialTypeLabels: Record<CredentialType, string> = {
  login: "Login",
  api_key: "API Key",
  oauth: "OAuth",
  ssh_key: "SSH Key",
  token: "Token",
  other: "Other",
}

const accessLevelLabels: Record<CredentialAccessLevel, string> = {
  superadmin_only: "Superadmin Only",
  managers: "Managers",
  hr_team: "HR Team",
  all_staff: "All Staff",
}

function CredentialCard({
  credential,
  onEdit,
  onDelete,
  onCopy,
}: {
  credential: MaskedCredential
  onEdit: (credential: MaskedCredential) => void
  onDelete: (credential: MaskedCredential) => void
  onCopy: (credentialId: string, field: string) => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isExpired = credential.expiresAt && new Date(credential.expiresAt) < new Date()
  const isExpiringSoon = credential.expiresAt && !isExpired &&
    new Date(credential.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  return (
    <Card className={cn(
      "border rounded-xl transition-all hover:shadow-md",
      !credential.isActive && "opacity-60",
      isExpired && "border-red-300 bg-red-50/50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{credential.name}</h3>
              {isExpired && (
                <Badge variant="destructive" className="text-xs">Expired</Badge>
              )}
              {isExpiringSoon && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                  Expiring Soon
                </Badge>
              )}
              {!credential.isActive && (
                <Badge variant="outline" className="text-xs">Inactive</Badge>
              )}
            </div>
            {credential.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {credential.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {credentialTypeLabels[credential.credentialType]}
              </Badge>
              {credential.username && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">User:</span>
                  <span className="font-mono">{credential.username}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => {
                      navigator.clipboard.writeText(credential.username || "")
                      toast.success("Username copied")
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {credential.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>{credential.email}</span>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {credential.hasPassword && (
                <DropdownMenuItem onClick={() => onCopy(credential.id, "password")}>
                  <Key className="h-4 w-4 mr-2" />
                  Copy Password
                </DropdownMenuItem>
              )}
              {credential.hasApiKey && (
                <DropdownMenuItem onClick={() => onCopy(credential.id, "apiKey")}>
                  <Key className="h-4 w-4 mr-2" />
                  Copy API Key
                </DropdownMenuItem>
              )}
              {credential.hasApiSecret && (
                <DropdownMenuItem onClick={() => onCopy(credential.id, "apiSecret")}>
                  <Key className="h-4 w-4 mr-2" />
                  Copy API Secret
                </DropdownMenuItem>
              )}
              {credential.url && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.open(credential.url, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open URL
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(credential)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(credential)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quick copy buttons for sensitive fields */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
          {credential.hasPassword && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => onCopy(credential.id, "password")}
            >
              <Lock className="h-3 w-3" />
              Password
              <Copy className="h-3 w-3 ml-1" />
            </Button>
          )}
          {credential.hasApiKey && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => onCopy(credential.id, "apiKey")}
            >
              <Key className="h-3 w-3" />
              API Key
              <Copy className="h-3 w-3 ml-1" />
            </Button>
          )}
          {credential.url && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => {
                navigator.clipboard.writeText(credential.url || "")
                toast.success("URL copied")
              }}
            >
              <ExternalLink className="h-3 w-3" />
              URL
              <Copy className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>

        {/* Last used info */}
        {credential.lastUsedAt && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last used: {new Date(credential.lastUsedAt).toLocaleDateString()}
            {credential.lastUsedBy && ` by ${credential.lastUsedBy.name}`}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CategorySection({
  category,
  credentials,
  onEdit,
  onDelete,
  onCopy,
}: {
  category: CredentialCategory
  credentials: MaskedCredential[]
  onEdit: (credential: MaskedCredential) => void
  onDelete: (credential: MaskedCredential) => void
  onCopy: (credentialId: string, field: string) => void
}) {
  const Icon = iconMap[category.icon || "Key"] || Key
  const colorClass = colorMap[category.color || "gray"] || colorMap.gray

  if (credentials.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className={cn("p-2 rounded-lg", colorClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{category.name}</h2>
          <p className="text-xs text-muted-foreground">{credentials.length} credential{credentials.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {credentials.map((credential) => (
          <CredentialCard
            key={credential.id}
            credential={credential}
            onEdit={onEdit}
            onDelete={onDelete}
            onCopy={onCopy}
          />
        ))}
      </div>
    </div>
  )
}

export default function CredentialsPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCredential, setEditingCredential] = useState<MaskedCredential | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [credentialToDelete, setCredentialToDelete] = useState<MaskedCredential | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateCredentialInput>({
    name: "",
    credentialType: "login",
    accessLevel: "superadmin_only",
  })

  const { data: groupedCredentials, isLoading, error, refetch } = useQuery({
    queryKey: ["credentials-by-category"],
    queryFn: getCredentialsByCategory,
  })

  const { data: categories } = useQuery({
    queryKey: ["credential-categories"],
    queryFn: getCredentialCategories,
  })

  const createMutation = useMutation({
    mutationFn: createCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials-by-category"] })
      setIsCreateOpen(false)
      resetForm()
      toast.success("Credential created successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create credential")
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials-by-category"] })
      setEditingCredential(null)
      resetForm()
      toast.success("Credential updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update credential")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials-by-category"] })
      setDeleteConfirmOpen(false)
      setCredentialToDelete(null)
      toast.success("Credential deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete credential")
    },
  })

  const resetForm = () => {
    setFormData({
      name: "",
      credentialType: "login",
      accessLevel: "superadmin_only",
    })
  }

  const handleEdit = (credential: MaskedCredential) => {
    setFormData({
      name: credential.name,
      description: credential.description,
      credentialType: credential.credentialType,
      categoryId: credential.categoryId,
      username: credential.username,
      email: credential.email,
      url: credential.url,
      apiEndpoint: credential.apiEndpoint,
      accessLevel: credential.accessLevel,
      expiresAt: credential.expiresAt,
      notes: credential.notes,
    })
    setEditingCredential(credential)
  }

  const handleDelete = (credential: MaskedCredential) => {
    setCredentialToDelete(credential)
    setDeleteConfirmOpen(true)
  }

  const handleCopy = async (credentialId: string, field: string) => {
    try {
      const secret = await getCredentialSecret(
        credentialId,
        field as "password" | "apiKey" | "apiSecret" | "accessToken" | "refreshToken"
      )
      if (secret) {
        await navigator.clipboard.writeText(secret)
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} copied to clipboard`)
      } else {
        toast.error("Could not retrieve secret")
      }
    } catch {
      toast.error("Failed to copy secret")
    }
  }

  const handleSubmit = () => {
    if (editingCredential) {
      updateMutation.mutate({ id: editingCredential.id, ...formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  // NOTE: useMemo must be called before any early returns to maintain consistent hook order
  // Filter credentials by search
  const filteredGroups = useMemo(() => {
    if (!groupedCredentials) return []
    if (!searchQuery) return groupedCredentials

    const query = searchQuery.toLowerCase()
    return groupedCredentials
      .map((group) => ({
        ...group,
        credentials: group.credentials.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.description?.toLowerCase().includes(query) ||
            c.username?.toLowerCase().includes(query) ||
            c.email?.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.credentials.length > 0)
  }, [groupedCredentials, searchQuery])

  const totalCredentials = groupedCredentials?.reduce((acc, g) => acc + g.credentials.length, 0) || 0

  // Early returns for loading and error states - after all hooks
  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load credentials"
        message="We couldn't load credentials. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Credentials</h1>
            <p className="text-xs text-white/90 mt-0.5">Securely manage credentials for job portals, APIs, and other services</p>
          </div>
        </div>
      </div>

      {/* Stats & Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-[38px] border-border rounded-lg"
            />
          </div>
          <Badge variant="secondary" className="text-sm">
            {totalCredentials} credential{totalCredentials !== 1 ? "s" : ""}
          </Badge>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Credential
        </Button>
      </div>

      {/* Credentials Grid by Category */}
      {filteredGroups.length > 0 ? (
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <CategorySection
              key={group.category.id}
              category={group.category}
              credentials={group.credentials}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCopy={handleCopy}
            />
          ))}
        </div>
      ) : (
        <Card className="border rounded-xl">
          <CardContent className="p-12">
            <EmptyState
              icon={Key}
              title="No credentials yet"
              description="Add your first credential to securely store login information, API keys, and more."
              action={{
                label: "Add Credential",
                onClick: () => setIsCreateOpen(true),
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editingCredential}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false)
            setEditingCredential(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCredential ? "Edit Credential" : "Add New Credential"}
            </DialogTitle>
            <DialogDescription>
              {editingCredential
                ? "Update the credential information. Leave password fields empty to keep existing values."
                : "Add a new credential for secure storage."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Naukri HR Account"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId || ""}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of this credential"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Credential Type</Label>
                <Select
                  value={formData.credentialType}
                  onValueChange={(value) => setFormData({ ...formData, credentialType: value as CredentialType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(credentialTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="access">Access Level</Label>
                <Select
                  value={formData.accessLevel}
                  onValueChange={(value) => setFormData({ ...formData, accessLevel: value as CredentialAccessLevel })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(accessLevelLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Login Credentials */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Login Credentials</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Username or login ID"
                    value={formData.username || ""}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Associated email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={editingCredential ? "Leave empty to keep existing" : "Enter password"}
                  value={formData.password || ""}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* API Credentials */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">API Credentials (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder={editingCredential ? "Leave empty to keep existing" : "Enter API key"}
                    value={formData.apiKey || ""}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    placeholder={editingCredential ? "Leave empty to keep existing" : "Enter API secret"}
                    value={formData.apiSecret || ""}
                    onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* URLs */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">URLs</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Login/Portal URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/login"
                    value={formData.url || ""}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiEndpoint">API Endpoint</Label>
                  <Input
                    id="apiEndpoint"
                    type="url"
                    placeholder="https://api.example.com"
                    value={formData.apiEndpoint || ""}
                    onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes or instructions..."
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false)
                setEditingCredential(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                "Saving..."
              ) : editingCredential ? (
                "Save Changes"
              ) : (
                "Add Credential"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Credential</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{credentialToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => credentialToDelete && deleteMutation.mutate(credentialToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

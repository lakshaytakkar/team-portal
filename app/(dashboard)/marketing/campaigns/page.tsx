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
  Megaphone,
  Calendar,
  Mail,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Campaign } from "@/lib/types/marketing"
import { initialCampaigns } from "@/lib/data/marketing"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CreateCampaignDialog } from "@/components/marketing/CreateCampaignDialog"
import { getAvatarForUser } from "@/lib/utils/avatars"

async function fetchCampaigns() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialCampaigns
}

const statusConfig: Record<string, { label: string; borderColor: string; textColor: string; dotColor: string }> = {
  draft: {
    label: "Draft",
    borderColor: "border-muted-foreground",
    textColor: "text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
  scheduled: {
    label: "Scheduled",
    borderColor: "border-[#3b82f6]",
    textColor: "text-[#3b82f6]",
    dotColor: "bg-[#3b82f6]",
  },
  active: {
    label: "Active",
    borderColor: "border-[#339d88]",
    textColor: "text-[#339d88]",
    dotColor: "bg-[#339d88]",
  },
  completed: {
    label: "Completed",
    borderColor: "border-[#339d88]",
    textColor: "text-[#339d88]",
    dotColor: "bg-[#339d88]",
  },
  paused: {
    label: "Paused",
    borderColor: "border-[#f59e0b]",
    textColor: "text-[#f59e0b]",
    dotColor: "bg-[#f59e0b]",
  },
}

export default function MarketingCampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)
  const { data: campaigns, isLoading, error, refetch } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
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
        title="Failed to load campaigns"
        message="We couldn't load campaigns. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredCampaigns = campaigns?.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Campaigns</h1>
            <p className="text-xs text-white/90 mt-0.5">Multi-channel campaign management (email + WhatsApp)</p>
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
            <Button onClick={() => setIsCreateCampaignOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </div>
        </div>

        <div className="p-5">
          {filteredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCampaigns.map((campaign) => {
                const status = statusConfig[campaign.status] || statusConfig.draft
                return (
                  <Card key={campaign.id} className="border border-border rounded-2xl hover:border-primary transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Megaphone className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-base text-foreground leading-6 tracking-[0.32px]">
                              {campaign.name}
                            </h3>
                          </div>
                          {campaign.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {campaign.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mb-3">
                            {campaign.channels.includes("email") && (
                              <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs gap-1">
                                <Mail className="h-3 w-3" />
                                Email
                              </Badge>
                            )}
                            {campaign.channels.includes("whatsapp") && (
                              <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs gap-1">
                                <MessageSquare className="h-3 w-3" />
                                WhatsApp
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            {campaign.startDate && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{new Date(campaign.startDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                            <div>
                              <span className="text-muted-foreground">Sent:</span>
                              <span className="font-medium ml-1">{campaign.sent || 0}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Opened:</span>
                              <span className="font-medium ml-1">{campaign.opened || 0}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Clicked:</span>
                              <span className="font-medium ml-1">{campaign.clicked || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-5 px-1.5 py-0.5 rounded-2xl text-xs gap-1 bg-background",
                            status.borderColor,
                            status.textColor
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", status.dotColor)} />
                          {status.label}
                        </Badge>
                        <RowActionsMenu
                          entityType="campaign"
                          entityId={campaign.id}
                          entityName={campaign.name}
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
              icon={Megaphone}
              title="No campaigns yet"
              description="Create your first marketing campaign to get started."
              action={{
                label: "Create Campaign",
                onClick: () => setIsCreateCampaignOpen(true),
              }}
            />
          )}
        </div>
      </Card>

      <CreateCampaignDialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen} />
    </div>
  )
}

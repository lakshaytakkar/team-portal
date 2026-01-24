"use client"

import { Card } from "@/components/ui/card"
import { JobRole } from "@/lib/types/recruitment"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Copy, ExternalLink } from "lucide-react"

interface JobRoleManagementCardProps {
  role: JobRole
}

export function JobRoleManagementCard({ role }: JobRoleManagementCardProps) {
  return (
    <div className="space-y-5">
      {/* Management Info */}
      <Card className="border border-[#dfe1e7] rounded-[14px] p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Management Info</h3>
        <div className="space-y-3">
          {role.createdBy && (
            <div>
              <span className="text-xs text-muted-foreground">Created By</span>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={role.createdBy.avatar} alt={role.createdBy.name} />
                  <AvatarFallback className="text-xs">
                    {role.createdBy.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{role.createdBy.name}</p>
                  {role.createdBy.email && (
                    <p className="text-xs text-muted-foreground">{role.createdBy.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Created Date</span>
            <span className="text-sm font-medium text-foreground">
              {format(new Date(role.createdAt), "MMM d, yyyy")}
            </span>
          </div>
          {role.updatedBy && (
            <div>
              <span className="text-xs text-muted-foreground">Last Updated By</span>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={role.updatedBy.avatar} alt={role.updatedBy.name} />
                  <AvatarFallback className="text-xs">
                    {role.updatedBy.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{role.updatedBy.name}</p>
                  {role.updatedBy.email && (
                    <p className="text-xs text-muted-foreground">{role.updatedBy.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Updated</span>
            <span className="text-sm font-medium text-foreground">
              {format(new Date(role.updatedAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </Card>

      {/* Related Links */}
      <Card className="border border-[#dfe1e7] rounded-[14px] p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <Link href={`/recruitment/job-postings?roleId=${role.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View All Postings
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <Link href={`/recruitment/applications?roleId=${role.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Applications
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Plus className="h-4 w-4 mr-2" />
            Create Job Posting
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Role
          </Button>
        </div>
      </Card>
    </div>
  )
}


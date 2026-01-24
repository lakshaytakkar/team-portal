"use client"

import { Application } from "@/lib/types/recruitment"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Link2 } from "lucide-react"

interface JobRoleApplicationsTableProps {
  applications: Application[]
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  applied: { label: "Applied", variant: "outline" },
  screening: { label: "Screening", variant: "default" },
  interview: { label: "Interview", variant: "default" },
  offer: { label: "Offer", variant: "default" },
  hired: { label: "Hired", variant: "default" },
  rejected: { label: "Rejected", variant: "secondary" },
}

export function JobRoleApplicationsTable({ applications }: JobRoleApplicationsTableProps) {
  const router = useRouter()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Applications</h3>
      </div>
      {applications.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Candidate</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Position</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Applied Date</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Source</span>
                </TableHead>
                <TableHead className="px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => {
                const status = statusConfig[app.status] || statusConfig.applied
                return (
                  <TableRow
                    key={app.id}
                    className="border-b border-border cursor-pointer hover:bg-muted/30"
                    onClick={() => router.push(`/recruitment/applications/${app.id}`)}
                  >
                    <TableCell className="px-3">
                      <Link
                        href={`/recruitment/candidates?search=${encodeURIComponent(app.candidateName)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={getAvatarForUser(app.candidateName)}
                            alt={app.candidateName}
                          />
                          <AvatarFallback className="text-xs">
                            {app.candidateName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{app.candidateName}</p>
                          <p className="text-xs text-muted-foreground">{app.candidateEmail}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">{app.position}</span>
                    </TableCell>
                    <TableCell className="px-3">
                      <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">
                        {format(new Date(app.appliedDate), "MMM d, yyyy")}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm text-muted-foreground capitalize">{app.source}</span>
                    </TableCell>
                    <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/recruitment/applications/${app.id}`}>
                        <Link2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No applications found for this role</p>
        </div>
      )}
    </div>
  )
}


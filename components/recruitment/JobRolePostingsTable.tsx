"use client"

import { JobPosting } from "@/lib/types/recruitment"
import { Button } from "@/components/ui/button"
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
import { Plus, Eye } from "lucide-react"
import Link from "next/link"

interface JobRolePostingsTableProps {
  postings: JobPosting[]
  roleId: string
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "Draft", variant: "outline" },
  published: { label: "Published", variant: "default" },
  closed: { label: "Closed", variant: "secondary" },
}

export function JobRolePostingsTable({ postings, roleId }: JobRolePostingsTableProps) {
  const router = useRouter()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Job Postings</h3>
        <Button size="sm" onClick={() => router.push(`/recruitment/job-postings?roleId=${roleId}`)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Job Posting
        </Button>
      </div>
      {postings.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Title</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Posted Date</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Applications</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Views</span>
                </TableHead>
                <TableHead className="px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {postings.map((posting) => {
                const status = statusConfig[posting.status] || statusConfig.draft
                return (
                  <TableRow
                    key={posting.id}
                    className="border-b border-border cursor-pointer hover:bg-muted/30"
                    onClick={() => router.push(`/recruitment/job-postings/${posting.id}`)}
                  >
                    <TableCell className="px-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{posting.title}</p>
                        <p className="text-xs text-muted-foreground">{posting.department}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-3">
                      <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3">
                      {posting.postedDate ? (
                        <span className="text-sm font-medium text-foreground">
                          {format(new Date(posting.postedDate), "MMM d, yyyy")}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not posted</span>
                      )}
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">
                        {posting.applications || 0}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">{posting.views || 0}</span>
                    </TableCell>
                    <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/recruitment/job-postings/${posting.id}`}>
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
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
          <p className="text-sm text-muted-foreground mb-4">No job postings found for this role</p>
          <Button size="sm" onClick={() => router.push(`/recruitment/job-postings?roleId=${roleId}`)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Job Posting
          </Button>
        </div>
      )}
    </div>
  )
}


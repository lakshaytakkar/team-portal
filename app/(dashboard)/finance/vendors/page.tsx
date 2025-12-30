"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  FileDown,
  Search,
  Filter,
  Building2,
  Phone,
  Mail,
  MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Vendor } from "@/lib/types/finance"
import { initialVendors } from "@/lib/data/finance"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CreateVendorDialog } from "@/components/finance/CreateVendorDialog"

async function fetchVendors() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialVendors
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  suspended: { label: "Suspended", variant: "outline" },
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: React.ElementType
}) {
  return (
    <Card className="border border-border rounded-2xl p-[18px] bg-white">
      <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
        {title}
      </p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xl font-semibold text-foreground leading-[1.35]">
          {value}
        </p>
        <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  )
}

export default function FinanceVendorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateVendorOpen, setIsCreateVendorOpen] = useState(false)
  const { data: vendors, isLoading, error, refetch } = useQuery({
    queryKey: ["vendors"],
    queryFn: fetchVendors,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border rounded-[14px]">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load vendors"
        message="We couldn't load vendors. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredVendors = vendors?.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const activeCount = vendors?.filter(v => v.status === "active").length || 0
  const totalCount = vendors?.length || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Vendors</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage vendor contacts and information</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Vendors" value={totalCount.toString()} icon={Building2} />
        <StatCard title="Active Vendors" value={activeCount.toString()} icon={Phone} />
        <StatCard title="Total Vendors" value={totalCount.toString()} icon={Mail} />
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
            <Button onClick={() => setIsCreateVendorOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Vendor
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="w-[200px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Vendor Name</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Contact Person</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Email</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Phone</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Payment Terms</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => {
                  const status = statusConfig[vendor.status] || statusConfig.active
                  return (
                    <TableRow key={vendor.id} className="border-b border-border">
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{vendor.name}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{vendor.contactPerson || "—"}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{vendor.email || "—"}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{vendor.phone || "—"}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{vendor.paymentTerms || "—"}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        <RowActionsMenu
                          entityType="vendor"
                          entityId={vendor.id}
                          entityName={vendor.name}
                          canView={true}
                          canEdit={true}
                          canDelete={false}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24">
                    <EmptyState
                      icon={Building2}
                      title="No vendors yet"
                      description="Get started by adding your first vendor."
                      action={{
                        label: "Add Vendor",
                        onClick: () => setIsCreateVendorOpen(true),
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CreateVendorDialog open={isCreateVendorOpen} onOpenChange={setIsCreateVendorOpen} />
    </div>
  )
}

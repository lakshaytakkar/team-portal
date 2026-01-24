"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Package } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import {
  formatCents,
  type FaireOrderItem,
  FaireOrderItemState,
  FAIRE_ORDER_ITEM_STATE_CONFIG,
} from "@/lib/types/faire"

interface OrderItemsTableProps {
  items: FaireOrderItem[]
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No items"
        description="This order doesn't have any items."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
          <TableHead className="px-3">
            <span className="text-sm font-medium text-muted-foreground">Product</span>
          </TableHead>
          <TableHead className="px-3">
            <span className="text-sm font-medium text-muted-foreground">SKU</span>
          </TableHead>
          <TableHead className="px-3 text-center">
            <span className="text-sm font-medium text-muted-foreground">Qty</span>
          </TableHead>
          <TableHead className="px-3 text-right">
            <span className="text-sm font-medium text-muted-foreground">Unit Price</span>
          </TableHead>
          <TableHead className="px-3 text-right">
            <span className="text-sm font-medium text-muted-foreground">Total</span>
          </TableHead>
          <TableHead className="px-3">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const stateConfig = FAIRE_ORDER_ITEM_STATE_CONFIG[item.state]
          return (
            <TableRow key={item.id} className="border-b border-border">
              <TableCell className="px-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground line-clamp-1">
                      {item.productName || "Unknown Product"}
                    </span>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">
                        {item.variantName}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-3">
                <span className="text-xs font-mono text-muted-foreground">
                  {item.sku || "—"}
                </span>
              </TableCell>
              <TableCell className="px-3 text-center">
                <span className="text-sm font-medium text-foreground">
                  {item.quantity}
                </span>
              </TableCell>
              <TableCell className="px-3 text-right">
                <span className="text-sm text-foreground">
                  {formatCents(item.priceCents || 0)}
                </span>
              </TableCell>
              <TableCell className="px-3 text-right">
                <span className="text-sm font-medium text-foreground">
                  {formatCents((item.priceCents || 0) * (item.quantity || 1))}
                </span>
              </TableCell>
              <TableCell className="px-3">
                <span
                  className="inline-flex items-center h-5 px-2 py-0.5 rounded-md text-xs font-medium"
                  style={{
                    backgroundColor: stateConfig?.bgColor || "#f3f4f6",
                    color: stateConfig?.color || "#374151",
                  }}
                >
                  {stateConfig?.label || item.state}
                </span>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

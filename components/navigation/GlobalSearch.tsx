"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Command, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { searchPages, CATEGORY_LABELS, CATEGORY_MAP } from "@/lib/utils/sidebar-context"
import type { UserContext } from "@/lib/types/user-context"
import type { MenuItem } from "@/components/layouts/Sidebar"

interface GlobalSearchProps {
  user: UserContext | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function GlobalSearch({ user, open: controlledOpen, onOpenChange }: GlobalSearchProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const results = React.useMemo(() => {
    if (!query.trim()) return []
    return searchPages(user, query)
  }, [user, query])

  // Keyboard shortcut: ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
        setQuery("")
        setSelectedIndex(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, setOpen])

  // Handle arrow keys and enter
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault()
        handleSelect(results[selectedIndex])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, results, selectedIndex])

  const handleSelect = (item: MenuItem) => {
    router.push(item.href)
    setOpen(false)
    setQuery("")
    setSelectedIndex(0)
  }

  const getCategoryLabel = (item: MenuItem) => {
    if (!item.section) return "Other"
    const category = CATEGORY_MAP[item.section] || item.section
    return CATEGORY_LABELS[category] || category
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search pages..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto text-base"
              autoFocus
            />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">
                <Command className="w-3 h-3 inline" />
              </kbd>
              <span>K</span>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {query.trim() ? (
              results.length > 0 ? (
                <div className="p-2">
                  {results.map((item, index) => {
                    const Icon = item.icon
                    const isSelected = index === selectedIndex
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                          isSelected
                            ? "bg-muted"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {getCategoryLabel(item)}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No results found for "{query}"
                </div>
              )
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Start typing to search pages...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


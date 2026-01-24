"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Grid3x3, FileSearch } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PageCard } from "./PageCard"
import { CategoryTabs } from "./CategoryTabs"
import { getPagesByCategory, searchPages, CATEGORY_LABELS } from "@/lib/utils/sidebar-context"
import type { UserContext } from "@/lib/types/user-context"
import { EmptyState } from "@/components/ui/empty-state"

interface IndexPageProps {
  user: UserContext | null
}

export function IndexPage({ user }: IndexPageProps) {
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category')
  
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    // Initialize from URL if present, otherwise default to first available category
    return categoryFromUrl || "executive"
  })
  const [searchQuery, setSearchQuery] = useState("")
  
  // Update active category when URL changes
  useEffect(() => {
    if (categoryFromUrl) {
      setActiveCategory(categoryFromUrl)
    }
  }, [categoryFromUrl])

  const pagesByCategory = useMemo(() => getPagesByCategory(user), [user])
  const categories = useMemo(
    () => Object.keys(pagesByCategory).filter(cat => pagesByCategory[cat].length > 0),
    [pagesByCategory]
  )

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchPages(user, searchQuery)
  }, [user, searchQuery])

  const displayPages = searchQuery.trim()
    ? searchResults
    : pagesByCategory[activeCategory] || []

  // If no category selected and no search, default to first category
  React.useEffect(() => {
    if (!searchQuery && categories.length > 0 && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0])
    }
  }, [categories, activeCategory, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">Explore Pages</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Browse and navigate to all available pages organized by category
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-12 text-base"
        />
      </div>

      {/* Category Tabs */}
      {!searchQuery && categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      )}

      {/* Search Results Header */}
      {searchQuery && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Found {searchResults.length} {searchResults.length === 1 ? 'page' : 'pages'} for "{searchQuery}"
          </p>
        </div>
      )}

      {/* Pages Grid */}
      {displayPages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayPages.map((item) => (
            <PageCard key={item.href} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileSearch}
          title={searchQuery ? "No pages found" : "No pages in this category"}
          description={
            searchQuery
              ? `Try searching for something else or check your spelling.`
              : `This category doesn't have any pages yet.`
          }
        />
      )}
    </div>
  )
}


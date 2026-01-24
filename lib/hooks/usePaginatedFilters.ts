"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback, useMemo } from "react"
import { DEFAULT_PAGE_SIZE } from "@/lib/types/faire"

interface UsePaginatedFiltersOptions {
  defaultSortBy?: string
  defaultSortOrder?: "asc" | "desc"
}

export function usePaginatedFilters(options: UsePaginatedFiltersOptions = {}) {
  const { defaultSortBy = "created_at", defaultSortOrder = "desc" } = options
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Parse current values from URL
  const page = useMemo(() => {
    const p = searchParams.get("page")
    return p ? parseInt(p, 10) : 1
  }, [searchParams])

  const pageSize = useMemo(() => {
    const ps = searchParams.get("pageSize")
    return ps ? parseInt(ps, 10) : DEFAULT_PAGE_SIZE
  }, [searchParams])

  const sortBy = useMemo(() => {
    return searchParams.get("sortBy") || defaultSortBy
  }, [searchParams, defaultSortBy])

  const sortOrder = useMemo(() => {
    const order = searchParams.get("sortOrder")
    return (order === "asc" || order === "desc") ? order : defaultSortOrder
  }, [searchParams, defaultSortOrder])

  const searchQuery = useMemo(() => {
    return searchParams.get("q") || ""
  }, [searchParams])

  const storeId = useMemo(() => {
    return searchParams.get("storeId") || "all"
  }, [searchParams])

  const state = useMemo(() => {
    return searchParams.get("state") || "all"
  }, [searchParams])

  // Update URL with new params
  const updateParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === "all") {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      })

      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  // Individual setters
  const setPage = useCallback(
    (newPage: number) => {
      updateParams({ page: newPage === 1 ? undefined : newPage })
    },
    [updateParams]
  )

  const setPageSize = useCallback(
    (newPageSize: number) => {
      // Reset to page 1 when changing page size
      updateParams({
        pageSize: newPageSize === DEFAULT_PAGE_SIZE ? undefined : newPageSize,
        page: undefined,
      })
    },
    [updateParams]
  )

  const setSort = useCallback(
    (newSortBy: string) => {
      // Toggle sort order if clicking same column, otherwise default to desc
      const newSortOrder =
        sortBy === newSortBy ? (sortOrder === "asc" ? "desc" : "asc") : "desc"
      updateParams({
        sortBy: newSortBy === defaultSortBy ? undefined : newSortBy,
        sortOrder: newSortOrder === defaultSortOrder ? undefined : newSortOrder,
        page: undefined, // Reset to page 1
      })
    },
    [updateParams, sortBy, sortOrder, defaultSortBy, defaultSortOrder]
  )

  const setSearchQuery = useCallback(
    (q: string) => {
      updateParams({ q: q || undefined, page: undefined })
    },
    [updateParams]
  )

  const setStoreId = useCallback(
    (id: string) => {
      updateParams({ storeId: id === "all" ? undefined : id, page: undefined })
    },
    [updateParams]
  )

  const setState = useCallback(
    (newState: string) => {
      updateParams({ state: newState === "all" ? undefined : newState, page: undefined })
    },
    [updateParams]
  )

  const resetFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  // Build pagination params for API
  const paginationParams = useMemo(
    () => ({
      page,
      pageSize,
      sortBy,
      sortOrder,
    }),
    [page, pageSize, sortBy, sortOrder]
  )

  return {
    // Current values
    page,
    pageSize,
    sortBy,
    sortOrder,
    searchQuery,
    storeId,
    state,
    // Setters
    setPage,
    setPageSize,
    setSort,
    setSearchQuery,
    setStoreId,
    setState,
    resetFilters,
    // Params for API
    paginationParams,
    updateParams,
  }
}

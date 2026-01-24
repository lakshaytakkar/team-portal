"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

export interface UseDetailNavigationOptions<T> {
  currentId: string
  items: T[]
  getId: (item: T) => string
  basePath: string
  onNavigate?: (id: string) => void
}

export interface UseDetailNavigationReturn {
  currentIndex: number
  hasNext: boolean
  hasPrev: boolean
  nextId: string | null
  prevId: string | null
  navigateNext: () => void
  navigatePrev: () => void
  navigateToIndex: (index: number) => void
}

export function useDetailNavigation<T>({
  currentId,
  items,
  getId,
  basePath,
  onNavigate,
}: UseDetailNavigationOptions<T>): UseDetailNavigationReturn {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(-1)

  // Find current index
  useEffect(() => {
    const index = items.findIndex((item) => getId(item) === currentId)
    setCurrentIndex(index >= 0 ? index : -1)
  }, [currentId, items, getId])

  const hasNext = currentIndex >= 0 && currentIndex < items.length - 1
  const hasPrev = currentIndex > 0

  const nextId = hasNext && currentIndex >= 0 ? getId(items[currentIndex + 1]) : null
  const prevId = hasPrev && currentIndex >= 0 ? getId(items[currentIndex - 1]) : null

  const navigateNext = useCallback(() => {
    if (nextId) {
      if (onNavigate) {
        onNavigate(nextId)
      } else {
        router.push(`${basePath}/${nextId}`)
      }
    }
  }, [nextId, basePath, router, onNavigate])

  const navigatePrev = useCallback(() => {
    if (prevId) {
      if (onNavigate) {
        onNavigate(prevId)
      } else {
        router.push(`${basePath}/${prevId}`)
      }
    }
  }, [prevId, basePath, router, onNavigate])

  const navigateToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < items.length) {
        const id = getId(items[index])
        if (onNavigate) {
          onNavigate(id)
        } else {
          router.push(`${basePath}/${id}`)
        }
      }
    },
    [items, getId, basePath, router, onNavigate]
  )

  return {
    currentIndex,
    hasNext,
    hasPrev,
    nextId,
    prevId,
    navigateNext,
    navigatePrev,
    navigateToIndex,
  }
}


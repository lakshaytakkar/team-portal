"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface DetailTab {
  id: string
  label: string
  content: React.ReactNode
  disabled?: boolean
}

export interface DetailTabsProps {
  tabs: DetailTab[]
  defaultTab?: string
  onTabChange?: (tabId: string) => void
  className?: string
}

export function DetailTabs({ tabs, defaultTab, onTabChange, className }: DetailTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id || "")

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab)
    }
  }, [defaultTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    onTabChange?.(value)
  }

  if (tabs.length === 0) {
    return null
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className={cn("w-full", className)}>
      <TabsList className="bg-muted p-0.5 rounded-xl mb-6">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}


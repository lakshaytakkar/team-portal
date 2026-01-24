"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DetailTab {
  id: string
  label: string
  content: React.ReactNode
  disabled?: boolean
}

export interface DetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  tabs?: DetailTab[]
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  defaultTab?: string
  onTabChange?: (tabId: string) => void
}

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  tabs,
  children,
  footer,
  className,
  defaultTab,
  onTabChange,
}: DetailDrawerProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs?.[0]?.id || "")

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab)
    } else if (tabs && tabs.length > 0) {
      setActiveTab(tabs[0].id)
    }
  }, [defaultTab, tabs])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    onTabChange?.(value)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn("p-0 flex flex-col w-full sm:w-[480px] lg:w-[540px]", className)}
        hideCloseButton={true}
      >
        {/* Header */}
        <SheetHeader className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <SheetTitle className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">
            {title}
          </SheetTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="border border-[#dfe1e7] rounded-full size-10 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-[#666d80]" />
          </button>
        </SheetHeader>

        {/* Tabs (if provided) */}
        {tabs && tabs.length > 0 && (
          <div className="border-b border-[#dfe1e7] px-6 py-4 shrink-0">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="bg-muted p-0.5 rounded-xl w-full">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    disabled={tab.disabled}
                    className="flex-1 h-10 px-4 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tabs && tabs.length > 0 ? (
            tabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(activeTab === tab.id ? "block" : "hidden")}
              >
                {tab.content}
              </div>
            ))
          ) : (
            children
          )}
        </div>

        {/* Footer */}
        {footer && (
          <SheetFooter className="border-t border-[#dfe1e7] h-[88px] flex items-center justify-end gap-3.5 px-6 shrink-0">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}


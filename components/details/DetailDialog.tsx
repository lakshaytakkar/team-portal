"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface DetailTab {
  id: string
  label: string
  content: React.ReactNode
  disabled?: boolean
}

export interface DetailDialogProps {
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

export function DetailDialog({
  open,
  onOpenChange,
  title,
  tabs,
  children,
  footer,
  className,
  defaultTab,
  onTabChange,
}: DetailDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[540px] max-h-[90vh] flex flex-col p-0", className)}>
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-border">
          <DialogTitle className="text-lg font-semibold text-foreground leading-[1.4] tracking-[0.36px]">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Tabs (if provided) */}
        {tabs && tabs.length > 0 && (
          <div className="border-b border-border px-6 py-4 flex-shrink-0">
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
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
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
          <div className="border-t border-border h-[88px] flex items-center justify-end gap-3.5 px-6 flex-shrink-0">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}




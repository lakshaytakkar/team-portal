"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Code, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

export function ModeToggle() {
  const pathname = usePathname()
  const router = useRouter()
  
  const isDevMode = pathname.startsWith("/dev")
  
  const toggleMode = () => {
    if (isDevMode) {
      router.push("/")
    } else {
      router.push("/dev")
    }
  }

  return (
    <Button
      onClick={toggleMode}
      variant="outline"
      size="sm"
      className={cn(
        "gap-2 h-8 px-3 text-xs font-medium",
        isDevMode 
          ? "border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700" 
          : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {isDevMode ? (
        <>
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Main App</span>
        </>
      ) : (
        <>
          <Code className="h-3.5 w-3.5" />
          <span>Dev Portal</span>
        </>
      )}
    </Button>
  )
}


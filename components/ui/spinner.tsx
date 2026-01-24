import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
  centered?: boolean
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
}

export function Spinner({ 
  size = "md", 
  className, 
  text,
  centered = false 
}: SpinnerProps) {
  const spinner = (
    <Loader2 className={cn("animate-spin", sizeMap[size], className)} />
  )

  if (text) {
    return (
      <div className={cn("flex items-center gap-2", centered && "justify-center")}>
        {spinner}
        <span>{text}</span>
      </div>
    )
  }

  if (centered) {
    return (
      <div className="flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}





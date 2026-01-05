"use client"

import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { FaireOrderState, FAIRE_ORDER_STATE_CONFIG } from "@/lib/types/faire"

interface OrderStateWorkflowProps {
  currentState: FaireOrderState
}

const WORKFLOW_STATES: FaireOrderState[] = [
  FaireOrderState.NEW,
  FaireOrderState.PROCESSING,
  FaireOrderState.PRE_TRANSIT,
  FaireOrderState.IN_TRANSIT,
  FaireOrderState.DELIVERED,
]

export function OrderStateWorkflow({ currentState }: OrderStateWorkflowProps) {
  const currentConfig = FAIRE_ORDER_STATE_CONFIG[currentState]
  const currentOrder = currentConfig?.order || 0

  // Handle special states
  if (
    currentState === FaireOrderState.CANCELED ||
    currentState === FaireOrderState.BACKORDERED
  ) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-lg"
        style={{ backgroundColor: currentConfig?.bgColor }}
      >
        <span
          className="text-sm font-medium"
          style={{ color: currentConfig?.color }}
        >
          Order Status: {currentConfig?.label}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
      {WORKFLOW_STATES.map((state, index) => {
        const config = FAIRE_ORDER_STATE_CONFIG[state]
        const stateOrder = config?.order || 0
        const isCompleted = currentOrder > stateOrder
        const isCurrent = currentState === state
        const isUpcoming = currentOrder < stateOrder

        return (
          <div key={state} className="flex items-center flex-1">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                  isCompleted && "bg-green-500 border-green-500",
                  isCurrent && "border-primary bg-primary",
                  isUpcoming && "border-muted-foreground/30 bg-background"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                ) : (
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isCurrent && "text-white",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-2 text-center",
                  (isCompleted || isCurrent) && "font-medium text-foreground",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {config?.label}
              </span>
            </div>

            {/* Connector line */}
            {index < WORKFLOW_STATES.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 -mt-6">
                <div
                  className={cn(
                    "h-full transition-colors",
                    isCompleted ? "bg-green-500" : "bg-muted-foreground/20"
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

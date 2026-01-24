"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { prompts } from "@/lib/data/prompts"
import { cn } from "@/lib/utils"

export default function PromptsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const groupedPrompts = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.phase]) {
      acc[prompt.phase] = []
    }
    acc[prompt.phase].push(prompt)
    return acc
  }, {} as Record<number, typeof prompts>)

  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-2">
        <h1 className="tracking-tighter">Prompt Library</h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium">
          Strategic AI command library for accelerated development cycles.
        </p>
      </div>

      {Object.entries(groupedPrompts).map(([phase, phasePrompts]) => (
        <div key={phase} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Phase {phase}: {phasePrompts[0]?.phaseName}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {phasePrompts.map((prompt) => {
              const isExpanded = expandedIds.has(prompt.id)
              const isCopied = copiedId === prompt.id

              return (
                <Card key={prompt.id} className="bg-secondary/20 border-border/40 hover:border-primary/50 transition-all group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <CardTitle className="text-base font-bold tracking-tight group-hover:text-primary transition-colors">{prompt.title}</CardTitle>
                        {prompt.category && (
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-border/50 text-muted-foreground">
                            {prompt.category}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => copyToClipboard(prompt.content, prompt.id)}
                        className="h-9 w-9 bg-secondary/50 border border-border/40"
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recommended Usage</p>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">{prompt.usage}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(prompt.id)}
                      className="w-full h-10 border border-border/20 bg-secondary/30 hover:bg-secondary/50 font-bold tracking-tight"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Collapse Source
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Expand Prompt
                        </>
                      )}
                    </Button>

                    {isExpanded && (
                      <div className="mt-4 p-5 bg-secondary/50 rounded-xl border border-border/40 shadow-inner">
                        <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">
                          {prompt.content}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}


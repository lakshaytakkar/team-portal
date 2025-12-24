"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Code, Palette, Zap, Layers } from "lucide-react"
import { uiLibraries } from "@/lib/data/ui-libraries"

const typeIcons = {
  "component-library": Code,
  "design-system": Palette,
  "icon-library": Zap,
  utility: Layers,
}

export default function UILibrariesPage() {
  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-2">
        <h1 className="tracking-tighter">UI Infrastructure</h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium">
          Component systems, design tokens, and frontend libraries driving the visual engine.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {uiLibraries.map((library) => {
          const Icon = typeIcons[library.type] || Code
          return (
            <Card key={library.name} className="bg-secondary/20 border-border/40 hover:border-primary/50 hover:bg-secondary/30 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-start gap-5">
                  <div className="bg-secondary p-3.5 rounded-2xl border border-border/50 group-hover:scale-105 transition-transform">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">{library.name}</h3>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-border/50 text-muted-foreground mb-2">
                      {library.type.replace("-", " ")}
                    </Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 font-medium">{library.description}</p>
                    <div className="pt-3">
                      <a
                        href={library.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors uppercase tracking-widest"
                      >
                        Explore <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}


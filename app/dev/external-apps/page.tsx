"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Figma, Database, Rocket, GitBranch, FolderKanban } from "lucide-react"
import { externalApps } from "@/lib/data/external-apps"
import Image from "next/image"

const categoryIcons = {
  design: Figma,
  database: Database,
  deployment: Rocket,
  "version-control": GitBranch,
  "project-management": FolderKanban,
  other: ExternalLink,
}

export default function ExternalAppsPage() {
  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-2">
        <h1 className="tracking-tighter">External Ecosystem</h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium">
          Integrated tools, platforms, and services that augment our development workflow.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {externalApps.map((app) => {
          const Icon = categoryIcons[app.category] || ExternalLink
          return (
            <Card key={app.name} className="bg-secondary/20 border-border/40 hover:border-primary/50 hover:bg-secondary/30 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-start gap-5">
                  <div className="bg-secondary p-3.5 rounded-2xl border border-border/50 group-hover:scale-105 transition-transform flex-shrink-0">
                    {app.logo ? (
                      <Image src={app.logo} alt={app.name} width={28} height={28} className="opacity-90 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <Icon className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">{app.name}</h3>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-border/50 text-muted-foreground mb-2">
                      {app.category.replace("-", " ")}
                    </Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 font-medium">{app.description}</p>
                    <div className="pt-3">
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors uppercase tracking-widest"
                      >
                        Launch <ExternalLink className="h-3 w-3" />
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


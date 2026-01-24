"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { stackItems } from "@/lib/data/stack"
import Image from "next/image"

export default function StackPage() {
  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-2">
        <h1 className="tracking-tighter">Technology Stack</h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium">
          Core technologies, frameworks, and system components powering the portal.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stackItems.map((item) => (
          <Card key={item.name} className="bg-secondary/20 border-border/40 hover:border-primary/50 hover:bg-secondary/30 transition-all group">
            <CardContent className="p-6">
              <div className="flex items-start gap-5">
                <div className="bg-secondary p-3.5 rounded-2xl border border-border/50 group-hover:scale-105 transition-transform">
                  {item.logo && item.logo !== "/logos/Vector.svg" ? (
                    <Image src={item.logo} alt={item.name} width={28} height={28} className="opacity-90 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="size-7 bg-primary rounded-lg shadow-lg shadow-primary/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">{item.name}</h3>
                    {item.version && (
                      <span className="text-[10px] font-bold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded border border-border/40 uppercase tracking-widest">
                        {item.version}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 font-medium">{item.description}</p>
                  )}
                  <div className="pt-2">
                    <a
                      href={item.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors uppercase tracking-widest"
                    >
                      Documentation <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


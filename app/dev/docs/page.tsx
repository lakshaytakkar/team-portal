"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, ExternalLink, BookOpen } from "lucide-react"
import Link from "next/link"

const docCategories = [
  {
    name: "Project Documentation",
    docs: [
      { name: "PRD", path: "docs/prd.md", description: "Product requirements document" },
      { name: "Page Inventory", path: "docs/page-inventory.md", description: "All pages and their status" },
      { name: "Data Model", path: "docs/data-model.md", description: "Database schema specification" },
      { name: "Permissions", path: "docs/permissions.md", description: "Role-based access control" },
    ],
  },
  {
    name: "Development Guides",
    docs: [
      { name: "UX Contracts", path: "docs/ux-contracts.md", description: "Design patterns and standards" },
      { name: "Prompt Library", path: "docs/prompt-library.md", description: "AI prompts for development" },
      { name: "Dev Portal Spec", path: "docs/dev-portal-spec.md", description: "Developer portal specification" },
      { name: "Implementation Plans", path: "docs/implementation-phase1.md", description: "Phase-by-phase plans" },
    ],
  },
  {
    name: "Page Specifications",
    docs: [
      { name: "Dashboard", path: "docs/page-specs/dashboard.md", description: "Dashboard page spec" },
      { name: "Projects List", path: "docs/page-specs/projects-list.md", description: "Projects page spec" },
      { name: "Tasks List", path: "docs/page-specs/tasks-list.md", description: "Tasks page spec" },
      { name: "Calls List", path: "docs/page-specs/calls-list.md", description: "Calls page spec" },
      { name: "Attendance", path: "docs/page-specs/attendance.md", description: "Attendance page spec" },
    ],
  },
]

export default function DocsPage() {
  return (
    <div className="space-y-12 pb-12">
      <div className="space-y-2">
        <h1 className="tracking-tighter">Knowledge Base</h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium">
          Comprehensive project documentation, architectural specs, and implementation guidelines.
        </p>
      </div>

      {docCategories.map((category) => (
        <div key={category.name} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{category.name}</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {category.docs.map((doc) => (
              <Card key={doc.path} className="bg-secondary/20 border-border/40 hover:border-primary/50 hover:bg-secondary/30 transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-5">
                    <div className="bg-secondary p-3.5 rounded-2xl border border-border/50 group-hover:scale-105 transition-transform flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">{doc.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 font-medium">{doc.description}</p>
                      <div className="pt-3">
                        <a
                          href={`/${doc.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors uppercase tracking-widest"
                        >
                          Open Document <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}


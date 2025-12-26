"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Code } from "lucide-react"
import { stackItems } from "@/lib/data/stack"
import Image from "next/image"

export default function Home() {
  const projectInfo = {
    title: "HR Portal",
    purpose: "Internal team portal for employee management, project tracking, and task management",
    description: "A comprehensive HR management system built with modern web technologies. Designed for SuperAdmin, Managers, and Executives to manage teams, projects, tasks, attendance, and more.",
    startDate: "2024-01-01", // Update with actual start date
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-8">
        {/* Project Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{projectInfo.title}</h1>
            <p className="text-xl text-muted-foreground">{projectInfo.purpose}</p>
          </div>
          
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">About</h2>
                <p className="text-muted-foreground">{projectInfo.description}</p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Started: {new Date(projectInfo.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technology Stack */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Technology Stack</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stackItems.map((item) => (
              <Card key={item.name} className="hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                      {item.logo && item.logo !== "/logos/Vector.svg" ? (
                        <Image src={item.logo} alt={item.name} width={24} height={24} />
                      ) : (
                        <div className="w-6 h-6 bg-primary rounded" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        {item.version && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {item.version}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      )}
                      <a
                        href={item.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                      >
                        Documentation <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

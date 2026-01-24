"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Key, AlertCircle } from "lucide-react"
import Link from "next/link"

const envVars = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    description: "Supabase project URL",
    required: true,
    where: ".env.local, Vercel dashboard",
    example: "https://your-project.supabase.co",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    description: "Supabase anonymous key (public)",
    required: true,
    where: ".env.local, Vercel dashboard",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    description: "Supabase service role key (server-side only)",
    required: true,
    where: ".env.local (server only), Vercel dashboard",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    warning: "Never expose this in client-side code",
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    description: "Application URL for redirects and callbacks",
    required: false,
    where: ".env.local, Vercel dashboard",
    example: "https://your-app.vercel.app",
  },
]

export default function CredentialsPage() {
  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-2">
        <h1 className="tracking-tighter">System Credentials</h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium">
          Secure configuration reference for environment variables and platform integrations.
        </p>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0" />
            </div>
            <div>
              <p className="font-bold text-amber-500 tracking-tight mb-1">Security Protocol</p>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                This manifest only indexes environment keys and structural examples. Never commit actual 
                secrets to version control. Maintain all sensitive data in your local <code className="bg-secondary px-1.5 py-0.5 rounded text-amber-500">.env.local</code> 
                or protected production vaults.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Configuration Keys</h2>
        </div>

        <div className="grid gap-6">
          {envVars.map((envVar) => (
            <Card key={envVar.name} className="bg-secondary/20 border-border/40 hover:border-primary/50 transition-all group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-base font-mono font-bold tracking-tight group-hover:text-primary transition-colors">{envVar.name}</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{envVar.description}</p>
                  </div>
                  {envVar.required ? (
                    <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 text-[10px] font-bold uppercase tracking-widest">Required</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-secondary/50 text-[10px] font-bold uppercase tracking-widest border-border/40">Optional</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Storage Location</p>
                    <p className="text-xs text-muted-foreground font-bold tracking-tight bg-secondary/30 p-2 rounded border border-border/20">{envVar.where}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reference Format</p>
                    <code className="text-[11px] font-mono bg-secondary/50 p-2.5 rounded-lg border border-border/40 block text-primary/80 truncate shadow-inner">{envVar.example}</code>
                  </div>
                </div>
                {envVar.warning && (
                  <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-500 font-bold tracking-tight">{envVar.warning}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-secondary/20 border-border/40 rounded-2xl overflow-hidden">
        <CardHeader className="bg-secondary/40 border-b border-border/40">
          <CardTitle className="text-lg font-bold tracking-tight">Platform Integration Guide</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid gap-4">
            {[
              "Provision a new project workspace at supabase.com",
              "Navigate to Project Settings → API protocols",
              "Capture the Project URL and anonymous public keys",
              "Access service role keys from protected settings",
              "Populate the local .env.local manifest with captured keys",
              "Initialize database schemas via automated migration tools",
              "Configure RLS policies for granular access control"
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="size-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary group-hover:bg-primary transition-colors group-hover:text-white">
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


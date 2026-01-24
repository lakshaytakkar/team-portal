"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"
import { Icon } from "@/components/icons/Icon"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-secondary relative flex flex-col" style={{
      backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.03) 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }}>
      <div className="container mx-auto px-10 py-8 flex-1 flex flex-col">
        <div className="flex items-center justify-center">
          <Link href="/" className="flex items-center gap-3">
            <div 
              className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-primary overflow-hidden"
              style={{
                background: 'linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.15) 100%), linear-gradient(90deg, rgba(137, 126, 250, 1) 0%, rgba(137, 126, 250, 1) 100%)'
              }}
            >
              <Icon name="folder-check" size={24} className="brightness-0 invert" />
            </div>
            <p 
              className="font-semibold text-2xl leading-[1.3] text-[#0d0d12]"
              style={{ fontFamily: "var(--font-inter-tight)" }}
            >
              Team Portal
            </p>
          </Link>
        </div>

        <div className="mt-10 flex justify-center flex-1 flex-col">
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="space-y-2">
              <h1 
                className="text-5xl font-bold text-[#0d0d12]"
                style={{ fontFamily: "var(--font-inter-tight)" }}
              >
                404
              </h1>
              <h2 
                className="text-xl font-semibold text-[#0d0d12]"
                style={{ fontFamily: "var(--font-inter-tight)" }}
              >
                Page Not Found
              </h2>
              <p 
                className="text-base text-[#666d80] tracking-[0.32px]"
                style={{ fontFamily: "var(--font-inter-tight)" }}
              >
                The authentication page you're looking for doesn't exist.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                asChild
                className="h-[52px] rounded-xl bg-[#dad7fd] hover:bg-[#dad7fd]/90 text-white font-semibold text-base tracking-[0.32px] shadow-none"
                style={{ fontFamily: "var(--font-inter-tight)" }}
              >
                <Link href="/sign-in">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Sign In
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="h-[52px] rounded-xl border-[#dfe1e7] text-[#666d80] hover:bg-[#f1f5f9] font-medium text-base tracking-[0.32px]"
                style={{ fontFamily: "var(--font-inter-tight)" }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


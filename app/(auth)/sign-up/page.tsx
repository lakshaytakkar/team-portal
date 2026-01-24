"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, ArrowLeft } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-white border-0 shadow-none rounded-2xl">
        <CardContent className="p-8 space-y-8">
          {/* Sign Up Header */}
          <div className="flex flex-col gap-4 items-center">
            {/* User Icon with Gradient Background */}
            <div 
              className="relative p-4 rounded-full"
              style={{
                background: 'linear-gradient(to bottom, rgba(243, 242, 255, 0.48) 0%, rgba(243, 242, 255, 0) 100%)',
                border: '1px solid #f3f2ff'
              }}
            >
              <div 
                className="bg-white border border-[#dad7fd] rounded-full p-3.5 shadow-[0px_2px_4px_0px_rgba(179,212,253,0.04)] flex items-center justify-center"
              >
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            {/* Welcome Text */}
            <div className="flex flex-col gap-2 items-center text-center">
              <h1 
                className="text-2xl font-semibold leading-[1.3] text-[#0d0d12]"
                style={{ fontFamily: "var(--font-inter-tight)" }}
              >
                Registration Disabled
              </h1>
              <p 
                className="text-base leading-[1.5] text-[#666d80] tracking-[0.32px]"
                style={{ fontFamily: "var(--font-inter-tight)" }}
              >
                This is an internal portal. Registration is not available. Please contact your administrator for access.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-4">
            <Link href="/sign-in" className="block">
              <Button 
                className="w-full h-[52px] rounded-xl bg-[#dad7fd] hover:bg-[#dad7fd]/90 text-white font-semibold text-base tracking-[0.32px] shadow-none" 
                style={{ fontFamily: "var(--font-inter-tight)" }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

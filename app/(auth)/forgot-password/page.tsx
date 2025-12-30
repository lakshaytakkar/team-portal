"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Lock, FileText, HelpCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(37)

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto">
      <div className="w-full max-w-md mx-auto">
        <Card className="bg-white border-0 shadow-none rounded-2xl">
          <CardContent className="p-8 space-y-8">
            {/* Header with Icon */}
            <div className="flex flex-col items-center gap-4">
              {/* Mail Icon with Gradient Background */}
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
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>

              {/* Title and Description */}
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 
                  className="text-2xl font-semibold leading-[1.3] text-[#0d0d12]"
                  style={{ fontFamily: "var(--font-inter-tight)" }}
                >
                  Forgot password
                </h1>
                <p 
                  className="text-base leading-[1.5] text-[#666d80] tracking-[0.32px]"
                  style={{ fontFamily: "var(--font-inter-tight)" }}
                >
                  We have sent a verification code to email address{" "}
                  <span className="font-medium text-[#0d0d12]">johndoe@example.com</span>
                </p>
              </div>
            </div>

            {/* OTP Input Fields */}
            <div className="flex gap-4">
              {otp.map((value, index) => (
                <div key={index} className="flex-1">
                  <Input
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`h-[52px] text-2xl font-semibold text-center text-[#0d0d12] border rounded-xl ${
                      value && index === 2
                        ? "bg-primary/10 border-primary"
                        : "bg-white border-[#dfe1e7]"
                    } focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0`}
                    style={{ fontFamily: "var(--font-inter-tight)" }}
                  />
                </div>
              ))}
            </div>

            {/* Verify Button */}
            <Button 
              className="w-full h-[52px] rounded-xl bg-[#dad7fd] hover:bg-[#dad7fd]/90 text-white font-semibold text-base tracking-[0.32px] shadow-none" 
              type="button"
              style={{ fontFamily: "var(--font-inter-tight)" }}
            >
              Verify
            </Button>

            {/* Resend Code */}
            <p 
              className="text-base text-[#666d80] text-center leading-[1.5] tracking-[0.32px]"
              style={{ fontFamily: "var(--font-inter-tight)" }}
            >
              Resend code in <span className="font-medium text-primary">00:{String(timeLeft).padStart(2, "0")}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="w-full px-8 py-8 flex items-center justify-between mt-auto">
        <p 
          className="text-sm text-[#666d80] leading-[1.5] tracking-[0.28px]"
          style={{ fontFamily: "var(--font-inter-tight)" }}
        >
          © 2025 Team Portal. All right reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link 
            href="#" 
            className="flex items-center gap-1.5 text-sm text-[#666d80] leading-[1.5] tracking-[0.28px] hover:text-[#0d0d12] transition-colors"
            style={{ fontFamily: "var(--font-inter-tight)" }}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy</span>
          </Link>
          <Link 
            href="#" 
            className="flex items-center gap-1.5 text-sm text-[#666d80] leading-[1.5] tracking-[0.28px] hover:text-[#0d0d12] transition-colors"
            style={{ fontFamily: "var(--font-inter-tight)" }}
          >
            <FileText className="w-4 h-4" />
            <span>Terms</span>
          </Link>
          <Link 
            href="#" 
            className="flex items-center gap-1.5 text-sm text-[#666d80] leading-[1.5] tracking-[0.28px] hover:text-[#0d0d12] transition-colors"
            style={{ fontFamily: "var(--font-inter-tight)" }}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Get help</span>
          </Link>
        </div>
      </div>
    </div>
  )
}


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
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-8 space-y-8">
            {/* Header with Icon */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Outer gradient circle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-primary/10 via-transparent to-transparent border border-primary/20" />
                {/* Inner white circle with icon */}
                <div className="relative w-14 h-14 rounded-full bg-card border border-primary/30 flex items-center justify-center shadow-sm">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Title and Description */}
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-semibold text-foreground leading-[1.3]" style={{ fontFamily: "var(--font-inter-tight)" }}>
                  Forgot password
                </h1>
                <p className="text-base text-muted-foreground leading-[1.5] tracking-[0.32px]" style={{ fontFamily: "var(--font-inter-tight)" }}>
                  We have sent a verification code to email address{" "}
                  <span className="font-medium text-foreground">johndoe@examle.com</span>
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
                    className={`h-[52px] text-2xl font-semibold text-center text-foreground border rounded-xl ${
                      value && index === 2
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border"
                    } focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0`}
                    style={{ fontFamily: "var(--font-inter-tight)" }}
                  />
                </div>
              ))}
            </div>

            {/* Verify Button */}
            <Button className="w-full h-[52px] rounded-xl border border-primary shadow-lumin-xs" type="button">
              Verify
            </Button>

            {/* Resend Code */}
            <p className="text-base text-muted-foreground text-center leading-[1.5] tracking-[0.32px]" style={{ fontFamily: "var(--font-inter-tight)" }}>
              Resend code in <span className="font-medium text-primary">00:{String(timeLeft).padStart(2, "0")}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="w-full px-8 py-8 flex items-center justify-between mt-auto">
        <p className="text-sm text-muted-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: "var(--font-inter-tight)" }}>
          © 2025 LuminHR. All right reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link href="#" className="flex items-center gap-1.5 text-sm text-muted-foreground leading-[1.5] tracking-[0.28px] hover:text-foreground transition-colors">
            <Lock className="w-4 h-4" />
            <span style={{ fontFamily: "var(--font-inter-tight)" }}>Privacy</span>
          </Link>
          <Link href="#" className="flex items-center gap-1.5 text-sm text-muted-foreground leading-[1.5] tracking-[0.28px] hover:text-foreground transition-colors">
            <FileText className="w-4 h-4" />
            <span style={{ fontFamily: "var(--font-inter-tight)" }}>Terms</span>
          </Link>
          <Link href="#" className="flex items-center gap-1.5 text-sm text-muted-foreground leading-[1.5] tracking-[0.28px] hover:text-foreground transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span style={{ fontFamily: "var(--font-inter-tight)" }}>Get help</span>
          </Link>
        </div>
      </div>
    </div>
  )
}


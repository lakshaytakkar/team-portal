"use client"

import { useState, useTransition, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Eye, EyeOff } from "lucide-react"
import { signIn } from "@/lib/actions/auth"
import { toast } from "sonner"
import { useUser } from "@/lib/hooks/useUser"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const { user, isLoading: isUserLoading } = useUser()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)

  const message = searchParams.get('message')

  // If user is already logged in, redirect based on role
  useEffect(() => {
    if (!isUserLoading && user) {
      const redirectParam = searchParams.get('redirect')
      if (redirectParam && redirectParam !== '/') {
        router.push(redirectParam)
      } else {
        // Redirect superadmin/CEO to /explore, others to /projects
        const defaultRedirect = user.role === 'superadmin' ? '/explore' : '/projects'
        router.push(defaultRedirect)
      }
    }
  }, [user, isUserLoading, router, searchParams])

  // Show loading state while checking authentication
  if (isUserLoading) {
    return (
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Don't render form if user is already logged in (redirecting)
  if (user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    startTransition(async () => {
      try {
        // Get redirect parameter from URL
        const redirectParam = searchParams.get('redirect')
        const result = await signIn(formData.email, formData.password, redirectParam || undefined)
        
        if (result?.success) {
          toast.success("Signed in successfully")
          // Redirect client-side to avoid NEXT_REDIRECT error
          router.push(result.redirectTo || '/projects')
        }
      } catch (error: any) {
        // Only show error for actual failures
        toast.error("Sign in failed", {
          description: error instanceof Error ? error.message : "Invalid email or password",
        })
      }
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-white border-0 shadow-none rounded-2xl">
        <CardContent className="p-8 space-y-8">
          {/* Login Header */}
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
                <User className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            {/* Welcome Text */}
            <div className="flex flex-col gap-2 items-center text-center">
              <h1 
                className="text-2xl font-semibold leading-[1.3] text-[#0d0d12]"
                style={{ fontFamily: "var(--font-inter-tight)" }}
              >
                Welcome Back
              </h1>
              <p 
                className="text-base leading-[1.5] text-[#666d80] tracking-[0.32px]"
                style={{ fontFamily: "var(--font-inter-tight)" }}
              >
                Glad to see you again. Log in to your account.
              </p>
            </div>
          </div>

          {message && (
            <div className="p-3 text-sm text-muted-foreground bg-muted rounded-md">
              {message}
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-sm font-medium leading-[1.5] text-[#666d80] tracking-[0.28px]"
                style={{ fontFamily: "var(--font-inter-tight)" }}
              >
                Email Address <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isPending}
                className="h-[52px] px-3 py-2 rounded-xl border-[#dfe1e7] text-base placeholder:text-[#818898] tracking-[0.32px]"
                style={{ fontFamily: "var(--font-inter-tight)" }}
              />
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-sm font-medium leading-[1.5] text-[#666d80] tracking-[0.28px]"
                style={{ fontFamily: "var(--font-inter-tight)" }}
              >
                Password <span className="text-[#df1c41]">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isPending}
                  className="h-[52px] px-3 py-2 pr-10 rounded-xl border-[#dfe1e7] text-base placeholder:text-[#818898] tracking-[0.32px]"
                  style={{ fontFamily: "var(--font-inter-tight)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#818898] hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-6 w-6" />
                  ) : (
                    <Eye className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#666d80] tracking-[0.28px]">
                <Checkbox
                  aria-label="Keep me login"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: !!checked })}
                  disabled={isPending}
                  className="h-4 w-4 rounded-md border-[#dfe1e7]"
                />
                <span style={{ fontFamily: "var(--font-inter-tight)" }}>Keep me login</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline underline-offset-4 tracking-[0.28px]"
                style={{ fontFamily: "var(--font-inter-tight)" }}
              >
                Forgot Password?
              </Link>
            </div>

            <Button 
              className="w-full h-[52px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base tracking-[0.32px] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]" 
              type="submit" 
              disabled={isPending}
              style={{ fontFamily: "var(--font-inter-tight)" }}
            >
              {isPending ? "Signing in..." : "Login"}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md">
        <Card className="bg-white border-0 shadow-none rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}

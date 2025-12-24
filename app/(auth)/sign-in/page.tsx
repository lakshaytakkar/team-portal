import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logos/Logo"

export default function SignInPage() {
  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-semibold" style={{ fontFamily: "var(--font-inter-tight)" }}>
            Sign in
          </CardTitle>
          <CardDescription>
            Welcome back. Enter your details to continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-3">
            <Button type="button" variant="secondary" className="w-full">
              <span className="flex items-center gap-2">
                <Logo name="google" size={18} />
                Continue with Google
              </span>
            </Button>
            <Button type="button" variant="secondary" className="w-full">
              <span className="flex items-center gap-2">
                <Logo name="facebook" size={18} />
                Continue with Facebook
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="name@company.com" autoComplete="email" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline underline-offset-4"
                >
                  Forgot password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" autoComplete="current-password" />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox aria-label="Remember me" />
                Remember me
              </label>
            </div>

            <Button className="w-full" type="button">
              Sign in
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center">
            Don’t have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}




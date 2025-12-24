import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logos/Logo"

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-semibold" style={{ fontFamily: "var(--font-inter-tight)" }}>
            Sign up
          </CardTitle>
          <CardDescription>
            Create an account to start using the HR Portal.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-3">
            <Button type="button" variant="secondary" className="w-full">
              <span className="flex items-center gap-2">
                <Logo name="google" size={18} />
                Sign up with Google
              </span>
            </Button>
            <Button type="button" variant="secondary" className="w-full">
              <span className="flex items-center gap-2">
                <Logo name="facebook" size={18} />
                Sign up with Facebook
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" name="firstName" placeholder="Robert" autoComplete="given-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" name="lastName" placeholder="Johnson" autoComplete="family-name" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" name="email" type="email" placeholder="name@company.com" autoComplete="email" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" />
              <p className="text-xs text-muted-foreground">
                Use 8+ characters with a mix of letters and numbers.
              </p>
            </div>

            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <Checkbox aria-label="Accept terms" />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline underline-offset-4">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <Button className="w-full" type="button">
              Create account
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}




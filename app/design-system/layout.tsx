import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export const dynamic = 'force-dynamic'

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/design-system" className="text-xl font-semibold">
              Design System
            </Link>
            <nav className="flex gap-6">
              <div className="flex gap-4">
                <span className="text-sm font-medium text-muted-foreground">Foundations</span>
                <Link
                  href="/design-system/foundations/typography"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Typography
                </Link>
                <Link
                  href="/design-system/foundations/colors"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Colors
                </Link>
                <Link
                  href="/design-system/foundations/shadow"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Shadow
                </Link>
                <Link
                  href="/design-system/foundations/icons"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Icons
                </Link>
                <Link
                  href="/design-system/foundations/logos-cursor"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Logos & Cursor
                </Link>
              </div>
              <div className="flex gap-4">
                <span className="text-sm font-medium text-muted-foreground">Components</span>
                <Link
                  href="/design-system/components/buttons"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Buttons
                </Link>
                <Link
                  href="/design-system/components/forms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forms
                </Link>
                <Link
                  href="/design-system/components/badges"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Badges
                </Link>
                <Link
                  href="/design-system/components/avatar"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Avatar
                </Link>
                <Link
                  href="/design-system/components/composites"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Composites
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
      <main>{children}</main>
    </div>
  )
}


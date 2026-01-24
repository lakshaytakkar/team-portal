import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DesignSystemPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Design System
          </h1>
          <p className="text-xl text-muted-foreground">
            Explore the design tokens and components used throughout the HR Portal.
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Foundations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <Link href="/design-system/foundations/typography">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Typography</CardTitle>
                    <CardDescription>
                      Font families, sizes, weights, and line heights
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/design-system/foundations/colors">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Colors</CardTitle>
                    <CardDescription>
                      Color palette including primary, greyscale, and alert colors
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/design-system/foundations/shadow">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Shadow</CardTitle>
                    <CardDescription>
                      Elevation and depth through shadow utilities
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/design-system/foundations/icons">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Icons</CardTitle>
                    <CardDescription>
                      Icon library and usage
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/design-system/foundations/logos-cursor">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Logos & Cursor</CardTitle>
                    <CardDescription>
                      Brand logos and cursor styles
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <Link href="/design-system/components/buttons">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Buttons</CardTitle>
                    <CardDescription>
                      Button variants, sizes, and states
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/design-system/components/forms">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Forms</CardTitle>
                    <CardDescription>
                      Input fields, selects, checkboxes, and more
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/design-system/components/badges">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Badges</CardTitle>
                    <CardDescription>
                      Badge variants and styles
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/design-system/components/avatar">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Avatar</CardTitle>
                    <CardDescription>
                      User avatars with sizes and presence
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/design-system/components/composites">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Composites</CardTitle>
                    <CardDescription>
                      Higher-level UI components and layouts
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


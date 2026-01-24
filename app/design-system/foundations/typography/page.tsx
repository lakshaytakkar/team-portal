import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TypographyPage() {
  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-6xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          Typography
        </h1>
        <p className="text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          The style guide provides to change stylistic for your design site.
        </p>
      </div>

      <Separator />

      {/* Font Family Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Font Family
          </h2>
          <p className="text-muted-foreground">
            Inter Tight is used for headings and display text. Inter is used for body text.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-background rounded-lg flex items-center justify-center border shadow-sm">
                  <span className="text-4xl" style={{ fontFamily: 'var(--font-inter-tight)' }}>Aa</span>
                </div>
                <div>
                  <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-inter-tight)' }}>Inter Tight</CardTitle>
                  <CardDescription>Semibold</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-background rounded-lg flex items-center justify-center border shadow-sm">
                  <span className="text-4xl" style={{ fontFamily: 'var(--font-inter-tight)', fontWeight: 500 }}>Aa</span>
                </div>
                <div>
                  <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-inter-tight)', fontWeight: 500 }}>Inter Tight</CardTitle>
                  <CardDescription>Medium</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-background rounded-lg flex items-center justify-center border shadow-sm">
                  <span className="text-4xl" style={{ fontFamily: 'var(--font-inter-tight)', fontWeight: 400 }}>Aa</span>
                </div>
                <div>
                  <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-inter-tight)', fontWeight: 400 }}>Inter Tight</CardTitle>
                  <CardDescription>Regular</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Heading Styles */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          Heading
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-inter-tight)', letterSpacing: '-0.01em' }}>
              Heading 1
            </h1>
            <p className="text-sm text-muted-foreground">Heading 1 / Semibold / 48px</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-inter-tight)', letterSpacing: '-0.01em' }}>
              Heading 2
            </h2>
            <p className="text-sm text-muted-foreground">Heading 2 / Semibold / 40px</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-3xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-inter-tight)', letterSpacing: '-0.01em' }}>
              Heading 3
            </h3>
            <p className="text-sm text-muted-foreground">Heading 3 / Semibold / 32px</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-2xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-inter-tight)', letterSpacing: '-0.01em' }}>
              Heading 4
            </h4>
            <p className="text-sm text-muted-foreground">Heading 4 / Semibold / 24px</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-inter-tight)', letterSpacing: '-0.01em' }}>
              Heading 5
            </h5>
            <p className="text-sm text-muted-foreground">Heading 5 / Semibold / 20px</p>
          </div>

          <div className="space-y-4">
            <h6 className="text-lg font-semibold leading-tight" style={{ fontFamily: 'var(--font-inter-tight)', letterSpacing: '-0.01em' }}>
              Heading 6
            </h6>
            <p className="text-sm text-muted-foreground">Heading 6 / Semibold / 18px</p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Body Styles */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          Body
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Semibold Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>Body Large</h3>
            <p className="text-lg font-semibold leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-muted-foreground">Body Large / Semibold / 18px</p>

            <h3 className="text-base font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>Body Medium</h3>
            <p className="text-base font-semibold leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-muted-foreground">Body Medium / Semibold / 16px</p>

            <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>Body Small</h3>
            <p className="text-sm font-semibold leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-muted-foreground">Body Small / Semibold / 14px</p>

            <h3 className="text-xs font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>Body XSmall</h3>
            <p className="text-xs font-semibold leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-muted-foreground">Body XSmall / Semibold / 12px</p>
          </div>

          {/* Medium Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium" style={{ fontFamily: 'var(--font-inter-tight)' }}>Body Large</h3>
            <p className="text-lg font-medium leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-muted-foreground">Body Large / Medium / 18px</p>

            <h3 className="text-base font-medium" style={{ fontFamily: 'var(--font-inter-tight)' }}>Body Medium</h3>
            <p className="text-base font-medium leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-muted-foreground">Body Medium / Medium / 16px</p>

            <h3 className="text-sm font-medium" style={{ fontFamily: 'var(--font-inter-tight)' }}>Body Small</h3>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-muted-foreground">Body Small / Medium / 14px</p>

            <h3 className="text-xs font-medium" style={{ fontFamily: 'var(--font-inter-tight)' }}>Body XSmall</h3>
            <p className="text-xs font-medium leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-muted-foreground">Body XSmall / Medium / 12px</p>
          </div>

          {/* Regular Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-normal" style={{ fontFamily: 'var(--font-inter-tight)' }}>Body Large</h3>
            <p className="text-lg font-normal leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-muted-foreground">Body Large / Regular / 18px</p>

            <h3 className="text-base font-normal" style={{ fontFamily: 'var(--font-inter-tight)' }}>Body Medium</h3>
            <p className="text-base font-normal leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-muted-foreground">Body Medium / Regular / 16px</p>

            <h3 className="text-sm font-normal" style={{ fontFamily: 'var(--font-inter-tight)' }}>Body Small</h3>
            <p className="text-sm font-normal leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-muted-foreground">Body Small / Regular / 14px</p>

            <h3 className="text-xs font-normal" style={{ fontFamily: 'var(--font-inter-tight)' }}>Body XSmall</h3>
            <p className="text-xs font-normal leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-muted-foreground">Body XSmall / Regular / 12px</p>
          </div>
        </div>
      </section>
    </div>
  )
}



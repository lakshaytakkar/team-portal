import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function BadgesPage() {
  const colors = [
    { name: "Neutral", variant: "neutral" as const, outlineVariant: "neutral-outline" as const },
    { name: "Primary", variant: "primary" as const, outlineVariant: "primary-outline" as const },
    { name: "Green", variant: "green" as const, outlineVariant: "green-outline" as const },
    { name: "Yellow", variant: "yellow" as const, outlineVariant: "yellow-outline" as const },
    { name: "Red", variant: "red" as const, outlineVariant: "red-outline" as const },
  ]

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-6xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          Badges
        </h1>
        <p className="text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          The style guide provides to change stylistic for your design site.
        </p>
      </div>

      <Separator />

      {/* Plain Text Badges */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Plain Text Badges
          </h2>
        </div>

        {colors.map((color) => (
          <div key={color.name} className="space-y-4">
            <h3 className="text-lg font-medium">{color.name}</h3>
            <div className="flex flex-wrap gap-4">
              <Badge variant={color.variant} style="fill">Label</Badge>
              <Badge variant={color.variant} style="fill" size="sm">Label</Badge>
              <Badge variant={color.variant} style="fill" size="lg">Label</Badge>
              <Badge variant={color.outlineVariant} style="outline">Label</Badge>
              <Badge variant={color.outlineVariant} style="outline" size="sm">Label</Badge>
              <Badge variant={color.outlineVariant} style="outline" size="lg">Label</Badge>
            </div>
          </div>
        ))}
      </section>

      <Separator />

      {/* Dot Prefix Badges */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Dot Prefix Badges
          </h2>
        </div>

        {colors.map((color) => (
          <div key={color.name} className="space-y-4">
            <h3 className="text-lg font-medium">{color.name}</h3>
            <div className="flex flex-wrap gap-4">
              <Badge variant={color.variant} style="fill" showDot>Label</Badge>
              <Badge variant={color.variant} style="fill" size="sm" showDot>Label</Badge>
              <Badge variant={color.variant} style="fill" size="lg" showDot>Label</Badge>
              <Badge variant={color.outlineVariant} style="outline" showDot>Label</Badge>
              <Badge variant={color.outlineVariant} style="outline" size="sm" showDot>Label</Badge>
              <Badge variant={color.outlineVariant} style="outline" size="lg" showDot>Label</Badge>
            </div>
          </div>
        ))}
      </section>

      <Separator />

      {/* Close Icon Suffix Badges */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Close Icon Suffix Badges
          </h2>
        </div>

        {colors.map((color) => (
          <div key={color.name} className="space-y-4">
            <h3 className="text-lg font-medium">{color.name}</h3>
            <div className="flex flex-wrap gap-4">
              <Badge variant={color.variant} style="fill" showClose>Label</Badge>
              <Badge variant={color.variant} style="fill" size="sm" showClose>Label</Badge>
              <Badge variant={color.variant} style="fill" size="lg" showClose>Label</Badge>
              <Badge variant={color.outlineVariant} style="outline" showClose>Label</Badge>
              <Badge variant={color.outlineVariant} style="outline" size="sm" showClose>Label</Badge>
              <Badge variant={color.outlineVariant} style="outline" size="lg" showClose>Label</Badge>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}



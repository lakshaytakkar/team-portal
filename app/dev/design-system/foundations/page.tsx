"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Icon } from "@/components/icons/Icon"
import { allIconNames, type LuminIconName } from "@/components/icons/lumin-icons"
import { Logo, type LogoName } from "@/components/logos/Logo"

// Typography Content Component
function TypographyContent() {
  return (
    <div className="space-y-12">
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

// Colors Content Component
function ColorsContent() {
  const primaryColors = [
    { name: "50", value: "#F3F2FF", label: "50" },
    { name: "100", value: "#DAD7FD", label: "100" },
    { name: "200", value: "#C9C4FD", label: "200" },
    { name: "300", value: "#B0A9FC", label: "300" },
    { name: "400", value: "#A198FB", label: "400" },
    { name: "500", value: "#897EFA", label: "500" },
  ]

  const greyscaleColors = [
    { name: "0", value: "#F8FAFB", label: "0" },
    { name: "25", value: "#F6F8FA", label: "25" },
    { name: "50", value: "#ECEFF3", label: "50" },
    { name: "100", value: "#DFE1E7", label: "100" },
    { name: "200", value: "#C1C7D0", label: "200" },
    { name: "300", value: "#A4ACB9", label: "300" },
    { name: "400", value: "#818898", label: "400" },
    { name: "500", value: "#666D80", label: "500" },
    { name: "600", value: "#36394A", label: "600" },
    { name: "700", value: "#272835", label: "700" },
    { name: "800", value: "#1A1B25", label: "800" },
    { name: "900", value: "#0D0D12", label: "900" },
  ]

  const skyColors = [
    { name: "0", value: "#EFF6FF", label: "0" },
    { name: "25", value: "#BFDBFE", label: "25" },
    { name: "50", value: "#7EDCF1", label: "50" },
    { name: "100", value: "#3B82F6", label: "100" },
    { name: "200", value: "#1D4ED8", label: "200" },
    { name: "300", value: "#1E3A8A", label: "300" },
  ]

  const successColors = [
    { name: "0", value: "#ECFDF5", label: "0" },
    { name: "25", value: "#A7F3D0", label: "25" },
    { name: "50", value: "#34D399", label: "50" },
    { name: "100", value: "#10B981", label: "100" },
    { name: "200", value: "#047857", label: "200" },
    { name: "300", value: "#064E3B", label: "300" },
  ]

  const warningColors = [
    { name: "0", value: "#FFFBEB", label: "0" },
    { name: "25", value: "#FDE68A", label: "25" },
    { name: "50", value: "#FBBF24", label: "50" },
    { name: "100", value: "#F59E0B", label: "100" },
    { name: "200", value: "#B45309", label: "200" },
    { name: "300", value: "#78350F", label: "300" },
  ]

  const errorColors = [
    { name: "0", value: "#FEF2F2", label: "0" },
    { name: "25", value: "#FECACA", label: "25" },
    { name: "50", value: "#F87171", label: "50" },
    { name: "100", value: "#EF4444", label: "100" },
    { name: "200", value: "#B91C1C", label: "200" },
    { name: "300", value: "#7F1D1D", label: "300" },
  ]

  const ColorSwatch = ({ color }: { color: { name: string; value: string; label: string } }) => (
    <Card className="overflow-hidden">
      <div className="h-20" style={{ backgroundColor: color.value }} />
      <CardContent className="p-3">
        <p className="text-sm font-medium">{color.label}</p>
        <p className="text-xs text-muted-foreground">{color.value}</p>
      </CardContent>
    </Card>
  )

  const ColorSection = ({ title, count, colors }: { title: string; count: number; colors: typeof primaryColors }) => (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{count} colors</p>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {colors.map((color) => (
          <ColorSwatch key={color.name} color={color} />
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-12">
      {/* Primary Colors */}
      <ColorSection title="Primary" count={6} colors={primaryColors} />

      <Separator />

      {/* Greyscale Colors */}
      <ColorSection title="Greyscale" count={12} colors={greyscaleColors} />

      <Separator />

      {/* Alert Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ColorSection title="Alert/Sky" count={6} colors={skyColors} />
        <ColorSection title="Alert/Success" count={6} colors={successColors} />
        <ColorSection title="Alert/Warning" count={6} colors={warningColors} />
        <ColorSection title="Alert/Error" count={6} colors={errorColors} />
      </div>
    </div>
  )
}

// Shadow Content Component
function ShadowContent() {
  const shadows = [
    { name: "XSmall", className: "shadow-lumin-xs" },
    { name: "Small", className: "shadow-lumin-sm" },
    { name: "Medium", className: "shadow-lumin-md" },
    { name: "Large", className: "shadow-lumin-lg" },
    { name: "XLarge", className: "shadow-lumin-xl" },
    { name: "XXLarge", className: "shadow-lumin-2xl" },
  ]

  return (
    <div className="space-y-12">
      {/* Shadow Examples */}
      <div className="bg-muted/30 p-12 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {shadows.map((shadow) => (
            <div key={shadow.name} className="space-y-4">
              <Card className={`bg-card ${shadow.className} h-32 flex items-end p-4`}>
                <CardContent className="p-0">
                  <p className="text-base font-normal text-foreground">{shadow.name}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Icons Content Component
function IconsContent() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredIcons = allIconNames.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const copyToClipboard = (iconName: string) => {
    navigator.clipboard.writeText(iconName)
  }

  return (
    <div className="space-y-12">
      {/* Search */}
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Search icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <p className="text-sm text-muted-foreground">
          {filteredIcons.length} icon{filteredIcons.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Icon Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {filteredIcons.map((iconName) => (
          <Card
            key={iconName}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => copyToClipboard(iconName)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
              <div className="w-12 h-12 flex items-center justify-center bg-muted/50 rounded-lg">
                <Icon name={iconName as LuminIconName} size={24} />
              </div>
              <p className="text-xs font-medium text-center break-all">{iconName}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIcons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No icons found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  )
}

// Logos & Cursor Content Component
function LogosCursorContent() {
  const logoCategories = [
    {
      title: "Social Media",
      logos: ["google", "facebook", "instagram", "twitter", "linkedin", "youtube", "whatsapp", "discord", "slack", "telegram", "tiktok", "snapchat", "pinterest", "reddit"] as LogoName[],
    },
    {
      title: "Productivity",
      logos: ["notion", "figma", "trello", "monday", "zoom", "google-meet", "google-teams", "slack"] as LogoName[],
    },
    {
      title: "E-commerce & Payments",
      logos: ["shopify", "stripe", "paypal", "amazon", "klarna"] as LogoName[],
    },
    {
      title: "Google Services",
      logos: ["google", "google-drive", "google-photos", "google-maps", "google-cloud", "google-play", "google-analytics", "google-ads"] as LogoName[],
    },
    {
      title: "Media & Entertainment",
      logos: ["netflix", "spotify", "youtube", "soundcloud", "twitch", "vimeo"] as LogoName[],
    },
    {
      title: "Development & Design",
      logos: ["figma", "webflow", "wordpress"] as LogoName[],
    },
  ]

  const cursorTypes = [
    { name: "Default", description: "Standard pointer cursor" },
    { name: "Pointer", description: "Hand pointer for clickable elements" },
    { name: "Text", description: "I-beam cursor for text selection" },
    { name: "Crosshair", description: "Precise selection cursor" },
    { name: "Move", description: "Move cursor for draggable elements" },
    { name: "Resize EW", description: "Horizontal resize cursor" },
    { name: "Resize NS", description: "Vertical resize cursor" },
    { name: "Resize NW SE", description: "Diagonal resize cursor (top-left to bottom-right)" },
    { name: "Resize NE SW", description: "Diagonal resize cursor (top-right to bottom-left)" },
    { name: "Zoom In", description: "Zoom in cursor" },
    { name: "Zoom Out", description: "Zoom out cursor" },
    { name: "Not Allowed", description: "Action not allowed cursor" },
    { name: "Progress", description: "Loading/progress cursor" },
    { name: "Copy", description: "Copy cursor" },
    { name: "Grabbing", description: "Grabbing cursor" },
    { name: "Hourglass", description: "Wait/loading cursor" },
  ]

  const cursorClassByName: Record<string, string> = {
    Default: "cursor-default",
    Pointer: "cursor-pointer",
    Text: "cursor-text",
    Crosshair: "cursor-crosshair",
    Move: "cursor-move",
    "Resize EW": "cursor-ew-resize",
    "Resize NS": "cursor-ns-resize",
    "Resize NW SE": "cursor-nwse-resize",
    "Resize NE SW": "cursor-nesw-resize",
    "Zoom In": "cursor-zoom-in",
    "Zoom Out": "cursor-zoom-out",
    "Not Allowed": "cursor-not-allowed",
    Progress: "cursor-progress",
    Copy: "cursor-copy",
    Grabbing: "cursor-grabbing",
    Hourglass: "cursor-wait",
  }

  return (
    <div className="space-y-12">
      {/* Logos Section */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Logos
          </h2>
          <p className="text-muted-foreground">
            Brand logos and icons for social media, productivity tools, and services.
          </p>
        </div>

        {logoCategories.map((category) => (
          <div key={category.title} className="space-y-4">
            <h3 className="text-xl font-medium">{category.title}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {category.logos.map((logo) => (
                <Card key={logo} className="aspect-square">
                  <CardContent className="flex items-center justify-center p-4 h-full">
                    <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
                      <Logo name={logo} size={32} className="max-w-full max-h-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </section>

      <Separator />

      {/* Cursor Section */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Cursor
          </h2>
          <p className="text-muted-foreground">
            Cursor styles for different interaction states.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {cursorTypes.map((cursor) => (
            <Card
              key={cursor.name}
              className={`${cursorClassByName[cursor.name] ?? "cursor-default"} hover:shadow-md transition-shadow`}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                <div className="w-16 h-16 bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed">
                  <span className="text-xs text-muted-foreground">Cursor</span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{cursor.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cursor.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function FoundationsPage() {
  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-2">
        <h1 className="tracking-tighter">Foundations</h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium">
          Core visual language including typography, colors, shadows, icons, and logos.
        </p>
      </div>

      <Tabs defaultValue="typography" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="shadow">Shadow</TabsTrigger>
          <TabsTrigger value="icons">Icons</TabsTrigger>
          <TabsTrigger value="logos-cursor">Logos & Cursor</TabsTrigger>
        </TabsList>

        <TabsContent value="typography">
          <TypographyContent />
        </TabsContent>

        <TabsContent value="colors">
          <ColorsContent />
        </TabsContent>

        <TabsContent value="shadow">
          <ShadowContent />
        </TabsContent>

        <TabsContent value="icons">
          <IconsContent />
        </TabsContent>

        <TabsContent value="logos-cursor">
          <LogosCursorContent />
        </TabsContent>
      </Tabs>
    </div>
  )
}


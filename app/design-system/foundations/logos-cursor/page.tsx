import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Logo, type LogoName } from "@/components/logos/Logo"

export default function LogosCursorPage() {
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
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-6xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          Logos & Cursor
        </h1>
        <p className="text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          The style guide provides to change stylistic for your design site.
        </p>
      </div>

      <Separator />

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


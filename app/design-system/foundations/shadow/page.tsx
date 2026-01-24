import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function ShadowPage() {
  const shadows = [
    { name: "XSmall", className: "shadow-lumin-xs" },
    { name: "Small", className: "shadow-lumin-sm" },
    { name: "Medium", className: "shadow-lumin-md" },
    { name: "Large", className: "shadow-lumin-lg" },
    { name: "XLarge", className: "shadow-lumin-xl" },
    { name: "XXLarge", className: "shadow-lumin-2xl" },
  ]

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-6xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          Shadow
        </h1>
        <p className="text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          The style guide provides to change stylistic for your design site.
        </p>
      </div>

      <Separator />

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



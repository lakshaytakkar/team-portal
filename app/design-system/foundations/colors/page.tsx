import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function ColorsPage() {
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
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-6xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          Colors
        </h1>
        <p className="text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          The style guide provides to change stylistic for your design site.
        </p>
      </div>

      <Separator />

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



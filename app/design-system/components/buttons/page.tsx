import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft } from "lucide-react"
import { Logo, type LogoName } from "@/components/logos/Logo"

export default function ButtonsPage() {
  const sizes = [
    { name: "Large", size: "lg" as const },
    { name: "Medium", size: "md" as const },
    { name: "Small", size: "sm" as const },
    { name: "XSmall", size: "xsm" as const },
  ]

  const variants = [
    { name: "Primary", variant: "primary" as const },
    { name: "Secondary", variant: "secondary" as const },
    { name: "Tertiary", variant: "tertiary" as const },
    { name: "Destructive", variant: "destructive" as const },
  ]

  const states = [
    { name: "Default", disabled: false },
    { name: "Hover", disabled: false, className: "hover:bg-primary/90" },
    { name: "Focused", disabled: false, className: "focus-visible:ring-2" },
    { name: "Disabled", disabled: true },
  ]

  const socialButtons: Array<{ name: string; logo: LogoName; color: string; hoverColor: string; disabledColor: string }> = [
    { 
      name: "Google", 
      logo: "google", 
      color: "!bg-white !text-gray-900 border border-gray-300 cursor-pointer hover:!bg-gray-50 hover:border-gray-400",
      hoverColor: "!bg-gray-50 !text-gray-900 border border-gray-400 cursor-pointer",
      disabledColor: "!bg-white !text-gray-400 border border-gray-300 cursor-not-allowed"
    },
    { 
      name: "Facebook", 
      logo: "facebook", 
      color: "!bg-[#1877F2] !text-white cursor-pointer hover:!bg-[#1565C0]",
      hoverColor: "!bg-[#1565C0] !text-white cursor-pointer",
      disabledColor: "!bg-white !text-gray-400 border border-gray-300 cursor-not-allowed"
    },
    { 
      name: "Twitter", 
      logo: "twitter", 
      color: "!bg-[#1DA1F2] !text-white cursor-pointer hover:!bg-[#1A8CD8]",
      hoverColor: "!bg-[#1A8CD8] !text-white cursor-pointer",
      disabledColor: "!bg-white !text-gray-400 border border-gray-300 cursor-not-allowed"
    },
    { 
      name: "Apple", 
      logo: "apple", 
      color: "!bg-black !text-white cursor-pointer hover:!bg-gray-800",
      hoverColor: "!bg-gray-800 !text-white cursor-pointer",
      disabledColor: "!bg-white !text-gray-400 border border-gray-300 cursor-not-allowed"
    },
  ]

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-6xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          Buttons
        </h1>
        <p className="text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          The style guide provides to change stylistic for your design site.
        </p>
      </div>

      <Separator />

      {/* Regular Buttons */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Button Types
          </h2>
          <p className="text-muted-foreground">
            Different button variants and their states across sizes.
          </p>
        </div>

        {variants.map((variant) => (
          <div key={variant.name} className="space-y-6">
            <h3 className="text-xl font-medium">{variant.name}</h3>
            
            {/* With Text */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">With Text</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sizes.map((size) => (
                  <div key={size.name} className="space-y-3">
                    <p className="text-xs text-muted-foreground">{size.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {states.map((state) => (
                        <Button
                          key={state.name}
                          variant={variant.variant}
                          size={size.size}
                          disabled={state.disabled}
                          className={state.className}
                        >
                          Button
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Icon Only */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Icon Only</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sizes.map((size) => (
                  <div key={size.name} className="space-y-3">
                    <p className="text-xs text-muted-foreground">{size.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {states.map((state) => (
                        <Button
                          key={state.name}
                          variant={variant.variant}
                          size={`icon-${size.size}` as any}
                          disabled={state.disabled}
                          className={state.className}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      <Separator />

      {/* Social Buttons */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Social Buttons
          </h2>
          <p className="text-muted-foreground">
            Social login buttons for authentication.
          </p>
        </div>

        <div className="space-y-6">
          {socialButtons.map((social) => (
            <div key={social.name} className="space-y-4">
              <h3 className="text-xl font-medium">{social.name}</h3>
              <div className="flex flex-wrap gap-4 items-center">
                {/* Color with Brand - Default (with hover) */}
                <Button variant="outline" className={social.color} size="md">
                  <Logo name={social.logo} size={20} className="mr-2" />
                  <ChevronLeft className="h-4 w-4 mr-1.5" />
                  Sign in with {social.name}
                </Button>
                {/* Color with Brand - Hover State (visual demo) */}
                <Button variant="outline" className={social.hoverColor} size="md">
                  <Logo name={social.logo} size={20} className="mr-2" />
                  <ChevronLeft className="h-4 w-4 mr-1.5" />
                  Sign in with {social.name}
                </Button>
                {/* Neutral/Disabled */}
                <Button variant="outline" className={social.disabledColor} size="md" disabled>
                  <Logo name={social.logo} size={20} className="mr-2 opacity-50" />
                  <ChevronLeft className="h-4 w-4 mr-1.5 opacity-50" />
                  Sign in with {social.name}
                </Button>
                {/* Icon Only - Logo (with hover) */}
                <Button variant="outline" className={social.color} size="icon-md">
                  <Logo name={social.logo} size={20} />
                </Button>
                {/* Icon Only - Logo Brand Hover State (visual demo) */}
                <Button variant="outline" className={social.hoverColor} size="icon-md">
                  <Logo name={social.logo} size={20} />
                </Button>
                {/* Icon Only - Neutral */}
                <Button variant="outline" className={social.disabledColor} size="icon-md" disabled>
                  <Logo name={social.logo} size={20} className="opacity-50" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}


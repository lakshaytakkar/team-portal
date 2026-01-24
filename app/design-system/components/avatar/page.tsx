import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function AvatarPage() {
  const sizes = [
    { name: "16px", size: "h-4 w-4", textSize: "text-[8px]" },
    { name: "24px", size: "h-6 w-6", textSize: "text-xs" },
    { name: "32px", size: "h-8 w-8", textSize: "text-sm" },
    { name: "40px", size: "h-10 w-10", textSize: "text-base" },
    { name: "48px", size: "h-12 w-12", textSize: "text-lg" },
    { name: "64px", size: "h-16 w-16", textSize: "text-xl" },
  ]

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-6xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          Avatar
        </h1>
        <p className="text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          The style guide provides to change stylistic for your design site.
        </p>
      </div>

      <Separator />

      {/* Avatar Sizes */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Avatar Sizes
          </h2>
          <p className="text-muted-foreground">
            Different avatar sizes with photo, initials, and default placeholder.
          </p>
        </div>

        <div className="space-y-6">
          {sizes.map((size) => (
            <div key={size.name} className="space-y-4">
              <h3 className="text-lg font-medium">{size.name}</h3>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className={size.size}>
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback className={size.textSize}>JD</AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-muted-foreground">Photo</p>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Avatar className={size.size}>
                    <AvatarFallback className={size.textSize}>JD</AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-muted-foreground">Initials</p>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Avatar className={size.size}>
                    <AvatarFallback className={size.textSize}>
                      <svg className="h-1/2 w-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-muted-foreground">Default</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Presence Indicator */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Presence Indicator
          </h2>
          <p className="text-muted-foreground">
            Avatar with online/offline status indicators.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
          </div>
          <p className="text-sm text-muted-foreground">Online</p>

          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-gray-400" />
          </div>
          <p className="text-sm text-muted-foreground">Offline</p>
        </div>
      </section>
    </div>
  )
}



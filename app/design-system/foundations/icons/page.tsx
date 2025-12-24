"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Icon } from "@/components/icons/Icon"
import { allIconNames, type LuminIconName } from "@/components/icons/lumin-icons"

export default function IconsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredIcons = allIconNames.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const copyToClipboard = (iconName: string) => {
    navigator.clipboard.writeText(iconName)
    // You could add a toast notification here
  }

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-6xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          Icons
        </h1>
        <p className="text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          The style guide provides to change stylistic for your design site.
        </p>
      </div>

      <Separator />

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



"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronDown, Bell, LogOut, Mail, Menu, MoreVertical, Phone, Search, Settings, User } from "lucide-react"
import { Logo, type LogoName } from "@/components/logos/Logo"

// Buttons Content Component
function ButtonsContent() {
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
    <div className="space-y-12">
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
                <Button variant="outline" className={social.color} size="md">
                  <Logo name={social.logo} size={20} className="mr-2" />
                  <ChevronLeft className="h-4 w-4 mr-1.5" />
                  Sign in with {social.name}
                </Button>
                <Button variant="outline" className={social.hoverColor} size="md">
                  <Logo name={social.logo} size={20} className="mr-2" />
                  <ChevronLeft className="h-4 w-4 mr-1.5" />
                  Sign in with {social.name}
                </Button>
                <Button variant="outline" className={social.disabledColor} size="md" disabled>
                  <Logo name={social.logo} size={20} className="mr-2 opacity-50" />
                  <ChevronLeft className="h-4 w-4 mr-1.5 opacity-50" />
                  Sign in with {social.name}
                </Button>
                <Button variant="outline" className={social.color} size="icon-md">
                  <Logo name={social.logo} size={20} />
                </Button>
                <Button variant="outline" className={social.hoverColor} size="icon-md">
                  <Logo name={social.logo} size={20} />
                </Button>
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

// Forms Content Component
function FormsContent() {
  const [selectedValue, setSelectedValue] = useState("")

  return (
    <div className="space-y-12">
      {/* Input Fields */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Basic Input Field
          </h2>
          <p className="text-muted-foreground">
            Text input fields with different states.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input placeholder="Placeholder" />
            <p className="text-xs text-muted-foreground">This is a hint text to help user</p>
          </div>

          <div className="space-y-2">
            <Label>Label</Label>
            <Input placeholder="Placeholder" className="focus-visible:ring-2 focus-visible:ring-primary" />
            <p className="text-xs text-muted-foreground">This is a hint text to help user</p>
          </div>

          <div className="space-y-2">
            <Label>Label</Label>
            <Input placeholder="Placeholder" disabled />
            <p className="text-xs text-muted-foreground">This is a hint text to help user</p>
          </div>

          <div className="space-y-2">
            <Label className="text-destructive">Label</Label>
            <Input placeholder="Placeholder" className="border-destructive focus-visible:ring-destructive" />
            <p className="text-xs text-destructive">This is a hint text to help user</p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Textarea */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Text Area
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label>Label</Label>
            <Textarea placeholder="Placeholder" />
            <p className="text-xs text-muted-foreground">This is a hint text to help user</p>
          </div>

          <div className="space-y-2">
            <Label>Label</Label>
            <Textarea placeholder="Placeholder" className="focus-visible:ring-2 focus-visible:ring-primary" />
            <p className="text-xs text-muted-foreground">This is a hint text to help user</p>
          </div>

          <div className="space-y-2">
            <Label>Label</Label>
            <Textarea placeholder="Placeholder" disabled />
            <p className="text-xs text-muted-foreground">This is a hint text to help user</p>
          </div>

          <div className="space-y-2">
            <Label className="text-destructive">Label</Label>
            <Textarea placeholder="Placeholder" className="border-destructive focus-visible:ring-destructive" />
            <p className="text-xs text-destructive">This is a hint text to help user</p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Dropdown */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Dropdown
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label>Label</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Placeholder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">This is a hint text to help user</p>
          </div>

          <div className="space-y-2">
            <Label>Label</Label>
            <Select>
              <SelectTrigger className="focus-visible:ring-2 focus-visible:ring-primary">
                <SelectValue placeholder="Placeholder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">This is a hint text to help user</p>
          </div>

          <div className="space-y-2">
            <Label>Label</Label>
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Placeholder" />
              </SelectTrigger>
            </Select>
            <p className="text-xs text-muted-foreground">This is a hint text to help user</p>
          </div>

          <div className="space-y-2">
            <Label className="text-destructive">Label</Label>
            <Select>
              <SelectTrigger className="border-destructive focus-visible:ring-destructive">
                <SelectValue placeholder="Placeholder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-destructive">This is a hint text to help user</p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Checkbox */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Checkbox
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox id="checkbox-unchecked" />
            <Label htmlFor="checkbox-unchecked">Unchecked</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="checkbox-checked" checked />
            <Label htmlFor="checkbox-checked">Checked</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="checkbox-disabled-unchecked" disabled />
            <Label htmlFor="checkbox-disabled-unchecked" className="opacity-50">Disabled (Unchecked)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="checkbox-disabled-checked" checked disabled />
            <Label htmlFor="checkbox-disabled-checked" className="opacity-50">Disabled (Checked)</Label>
          </div>
        </div>
      </section>

      <Separator />

      {/* Radio Button */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Radio Button
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-2">
            <RadioGroup value={selectedValue} onValueChange={setSelectedValue}>
              <RadioGroupItem value="unchecked" id="radio-unchecked" />
            </RadioGroup>
            <Label htmlFor="radio-unchecked">Unchecked</Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroup value="checked">
              <RadioGroupItem value="checked" id="radio-checked" />
            </RadioGroup>
            <Label htmlFor="radio-checked">Checked</Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroup value={selectedValue} disabled>
              <RadioGroupItem value="disabled-unchecked" id="radio-disabled-unchecked" />
            </RadioGroup>
            <Label htmlFor="radio-disabled-unchecked" className="opacity-50">Disabled (Unchecked)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroup value="disabled-checked" disabled>
              <RadioGroupItem value="disabled-checked" id="radio-disabled-checked" />
            </RadioGroup>
            <Label htmlFor="radio-disabled-checked" className="opacity-50">Disabled (Checked)</Label>
          </div>
        </div>
      </section>

      <Separator />

      {/* Toggle */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Toggle
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-2">
            <Switch id="switch-off" />
            <Label htmlFor="switch-off">Off</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="switch-on" checked />
            <Label htmlFor="switch-on">On</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="switch-disabled-off" disabled />
            <Label htmlFor="switch-disabled-off" className="opacity-50">Disabled (Off)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="switch-disabled-on" checked disabled />
            <Label htmlFor="switch-disabled-on" className="opacity-50">Disabled (On)</Label>
          </div>
        </div>
      </section>
    </div>
  )
}

// Badges Content Component
function BadgesContent() {
  const colors = [
    { name: "Neutral", variant: "neutral" as const, outlineVariant: "neutral-outline" as const },
    { name: "Primary", variant: "primary" as const, outlineVariant: "primary-outline" as const },
    { name: "Green", variant: "green" as const, outlineVariant: "green-outline" as const },
    { name: "Yellow", variant: "yellow" as const, outlineVariant: "yellow-outline" as const },
    { name: "Red", variant: "red" as const, outlineVariant: "red-outline" as const },
  ]

  return (
    <div className="space-y-12">
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

// Avatar Content Component
function AvatarContent() {
  const sizes = [
    { name: "16px", size: "h-4 w-4", textSize: "text-[8px]" },
    { name: "24px", size: "h-6 w-6", textSize: "text-xs" },
    { name: "32px", size: "h-8 w-8", textSize: "text-sm" },
    { name: "40px", size: "h-10 w-10", textSize: "text-base" },
    { name: "48px", size: "h-12 w-12", textSize: "text-lg" },
    { name: "64px", size: "h-16 w-16", textSize: "text-xl" },
  ]

  return (
    <div className="space-y-12">
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

// Composites Content Component
function CompositesContent() {
  const [selectedValue, setSelectedValue] = useState("dashboard")
  const people = [
    {
      name: "Robert Johnson",
      initials: "RJ",
      role: "Super Admin",
      department: "HR Management",
      status: { label: "Active", variant: "green" as const },
    },
    {
      name: "Sarah Miller",
      initials: "SM",
      role: "Recruiter",
      department: "Talent",
      status: { label: "On Leave", variant: "yellow" as const },
    },
    {
      name: "Alex Brown",
      initials: "AB",
      role: "Payroll",
      department: "Finance",
      status: { label: "Inactive", variant: "red" as const },
    },
  ]

  return (
    <div className="space-y-12">
      {/* Sidebar Navigation */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Sidebar Navigation
          </h2>
        </div>

        <div className="flex gap-8">
          <Card className="w-64">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-white font-bold">L</span>
                </div>
                <CardTitle className="text-lg">LuminHR</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Main Menu</p>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start bg-primary/10 text-primary">
                    <Menu className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Menu className="h-4 w-4 mr-2" />
                    Projects
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Menu className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Management</p>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start">
                    Employee
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Attendance
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Recruitment
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Payroll
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Invoices
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Help & Center
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Toolbar */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Toolbar
          </h2>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Dashboard</h2>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-9" />
                </div>
                <Button variant="ghost" size="icon-sm" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>RJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Robert Johnson</p>
                    <p className="text-xs text-muted-foreground">Super Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Table Header */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Table Header
          </h2>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4">
                <Checkbox />
                <span className="text-sm font-medium">Table Header</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Table Row */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Table Row
          </h2>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4 flex-1">
                <Checkbox />
                <div className="flex-1">
                  <p className="text-sm font-medium">Title Name</p>
                  <p className="text-xs text-muted-foreground">Description</p>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">JD</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 -ml-2">
                    <AvatarFallback className="text-xs">SM</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 -ml-2">
                    <AvatarFallback className="text-xs">AB</AvatarFallback>
                  </Avatar>
                </div>
                <Badge variant="primary">Label</Badge>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon-sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Cards */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Cards
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Total Employee</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-green-600">👤</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">649</p>
              <p className="text-sm text-green-600 mt-2">+25.5% last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>PM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Full-view - 2 Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Website Redesign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="green">Completed</Badge>
              <p className="text-sm text-muted-foreground">5 tasks due soon</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>80%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-4/5" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">A</AvatarFallback>
                </Avatar>
                <Avatar className="h-6 w-6 -ml-2">
                  <AvatarFallback className="text-xs">B</AvatarFallback>
                </Avatar>
                <Avatar className="h-6 w-6 -ml-2">
                  <AvatarFallback className="text-xs">C</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Dropdown Menu */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Dropdown Menu
          </h2>
        </div>

        <Select value={selectedValue} onValueChange={setSelectedValue}>
          <SelectTrigger className="w-64">
            <div className="flex items-center gap-2">
              <Menu className="h-4 w-4 text-primary" />
              <SelectValue placeholder="Dashboard" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dashboard">
              <div className="flex items-center gap-2">
                <Menu className="h-4 w-4 text-primary" />
                Dashboard
              </div>
            </SelectItem>
            <SelectItem value="projects">Projects</SelectItem>
            <SelectItem value="calendar">Calendar</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <Separator />

      {/* Calendar View */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Calendar View
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Wed 28</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2 bg-primary/10 rounded border-l-2 border-primary">
                <p className="text-xs font-medium">Team Hall Meeting</p>
                <p className="text-xs text-muted-foreground">10:00 AM</p>
              </div>
              <div className="p-2 bg-green-100 rounded border-l-2 border-green-500">
                <p className="text-xs font-medium">Training Session</p>
                <p className="text-xs text-muted-foreground">2:00 PM</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Wed 29</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2 bg-primary/10 rounded border-l-2 border-primary">
                <p className="text-xs font-medium">Project Review</p>
                <p className="text-xs text-muted-foreground">11:00 AM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default function ComponentsPage() {
  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-2">
        <h1 className="tracking-tighter">Components Library</h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium">
          Reusable UI components including buttons, forms, badges, avatars, and composite layouts.
        </p>
      </div>

      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
          <TabsTrigger value="composites">Composites</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons">
          <ButtonsContent />
        </TabsContent>

        <TabsContent value="forms">
          <FormsContent />
        </TabsContent>

        <TabsContent value="badges">
          <BadgesContent />
        </TabsContent>

        <TabsContent value="avatar">
          <AvatarContent />
        </TabsContent>

        <TabsContent value="composites">
          <CompositesContent />
        </TabsContent>
      </Tabs>
    </div>
  )
}


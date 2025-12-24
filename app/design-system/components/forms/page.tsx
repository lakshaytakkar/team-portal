"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function FormsPage() {
  const [selectedValue, setSelectedValue] = useState("")

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-6xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          Forms
        </h1>
        <p className="text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-inter-tight)' }}>
          The style guide provides to change stylistic for your design site.
        </p>
      </div>

      <Separator />

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



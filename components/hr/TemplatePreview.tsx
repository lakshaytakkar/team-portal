"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, RefreshCw } from "lucide-react"
import type { HRTemplate } from "@/lib/types/hr"
import { extractVariables, replaceVariables, getSampleValues } from "@/lib/utils/template-variables"
import { toast } from "@/components/ui/sonner"

interface TemplatePreviewProps {
  template: HRTemplate
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const variables = extractVariables(template.content)
  const sampleValues = getSampleValues(variables)
  const [variableValues, setVariableValues] = useState<Record<string, string>>(sampleValues)

  const previewContent = useMemo(() => {
    return replaceVariables(template.content, variableValues)
  }, [template.content, variableValues])

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [variable]: value,
    }))
  }

  const handleReset = () => {
    setVariableValues(sampleValues)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(previewContent)
    toast.success("Preview content copied to clipboard")
  }

  return (
    <div className="space-y-6">
      {variables.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Variable Values</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {variables.map((variable) => (
                <div key={variable}>
                  <Label htmlFor={variable} className="text-sm">
                    {variable}
                    {template.variables?.[variable] && (
                      <span className="text-muted-foreground ml-2 font-normal">
                        - {template.variables[variable]}
                      </span>
                    )}
                  </Label>
                  <Input
                    id={variable}
                    value={variableValues[variable] || ""}
                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                    placeholder={`Enter value for ${variable}`}
                    className="mt-1"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Preview</CardTitle>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Output
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-background min-h-[300px]">
                <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
                  {previewContent}
                </pre>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-background min-h-[300px]">
              <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
                {template.content}
              </pre>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                No variables found in template
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}




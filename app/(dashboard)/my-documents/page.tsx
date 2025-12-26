"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, FileText } from "lucide-react"

export default function MyDocumentsPage() {
  const [activeTab, setActiveTab] = useState("files")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground leading-[1.35]">My Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access and manage your files, templates, and shared documents
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted p-0.5 rounded-xl h-auto border-0">
          <TabsTrigger
            value="files"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            My Files
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="shared"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            Shared
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* My Files Tab */}
          <TabsContent value="files" className="mt-0">
            <Card className="border border-border rounded-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-base font-medium text-muted-foreground mb-2">Coming Soon</p>
                  <p className="text-sm text-muted-foreground">Your documents and files will be available here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-0">
            <Card className="border border-border rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Message & Document Templates</CardTitle>
                <Button className="h-9 px-4 bg-primary text-white rounded-lg hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-base font-medium text-muted-foreground mb-2">No templates yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create reusable templates for messages, meeting notes, and documents.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shared Tab */}
          <TabsContent value="shared" className="mt-0">
            <Card className="border border-border rounded-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-base font-medium text-muted-foreground mb-2">No shared documents</p>
                  <p className="text-sm text-muted-foreground">
                    Documents shared with you by your team will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}


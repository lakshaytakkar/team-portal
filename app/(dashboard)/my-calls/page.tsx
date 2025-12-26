"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Phone } from "lucide-react"

type CallFilter = "all" | "today" | "this-week" | "scheduled" | "completed"

export default function MyCallsPage() {
  const [activeFilter, setActiveFilter] = useState<CallFilter>("all")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#0d0d12] leading-[1.35]">My Calls</h1>
          <p className="text-sm text-[#666d80] mt-1">
            Track and manage your sales and outreach calls
          </p>
        </div>
        <Button className="h-10 px-4 py-2 bg-[#897EFA] border border-[#897EFA] text-white rounded-lg hover:bg-[#897EFA]/90">
          <Plus className="h-4 w-4 mr-2" />
          New Call
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="border border-[#DFE1E7] rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-[#666D80] font-medium leading-5 tracking-[0.28px] mb-0.5">
            Total Calls
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-[#0D0D12] leading-[1.35]">0</p>
            <div className="bg-[#F3F2FF] rounded-lg w-9 h-9 flex items-center justify-center">
              <Phone className="h-5 w-5 text-[#897EFA]" />
            </div>
          </div>
        </Card>

        <Card className="border border-[#DFE1E7] rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-[#666D80] font-medium leading-5 tracking-[0.28px] mb-0.5">
            Today
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-[#0D0D12] leading-[1.35]">0</p>
            <div className="bg-[#F3F2FF] rounded-lg w-9 h-9 flex items-center justify-center">
              <Phone className="h-5 w-5 text-[#897EFA]" />
            </div>
          </div>
        </Card>

        <Card className="border border-[#DFE1E7] rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-[#666D80] font-medium leading-5 tracking-[0.28px] mb-0.5">
            This Week
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-[#0D0D12] leading-[1.35]">0</p>
            <div className="bg-[#F3F2FF] rounded-lg w-9 h-9 flex items-center justify-center">
              <Phone className="h-5 w-5 text-[#897EFA]" />
            </div>
          </div>
        </Card>

        <Card className="border border-[#DFE1E7] rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-[#666D80] font-medium leading-5 tracking-[0.28px] mb-0.5">
            Completed
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-[#0D0D12] leading-[1.35]">0</p>
            <div className="bg-[#F3F2FF] rounded-lg w-9 h-9 flex items-center justify-center">
              <Phone className="h-5 w-5 text-[#897EFA]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as CallFilter)}>
        <TabsList className="bg-[#F6F8FA] p-0.5 rounded-xl h-auto border-0">
          <TabsTrigger
            value="all"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-[#0D0D12] data-[state=inactive]:text-[#666D80] data-[state=inactive]:font-medium"
          >
            All Calls
          </TabsTrigger>
          <TabsTrigger
            value="today"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-[#0D0D12] data-[state=inactive]:text-[#666D80] data-[state=inactive]:font-medium"
          >
            Today
          </TabsTrigger>
          <TabsTrigger
            value="this-week"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-[#0D0D12] data-[state=inactive]:text-[#666D80] data-[state=inactive]:font-medium"
          >
            This Week
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-[#0D0D12] data-[state=inactive]:text-[#666D80] data-[state=inactive]:font-medium"
          >
            Scheduled
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-[#0D0D12] data-[state=inactive]:text-[#666D80] data-[state=inactive]:font-medium"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="mt-6">
          <TabsContent value="all" className="mt-0">
            <Card className="border border-[#DFE1E7] rounded-2xl">
              <CardHeader>
                <CardTitle>Calls Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-[#666d80]">
                        <div className="flex flex-col items-center justify-center py-12">
                          <p className="text-base font-medium text-[#666d80] mb-2">Coming Soon</p>
                          <p className="text-sm text-[#666d80]">Your calls will be displayed here.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="today" className="mt-0">
            <Card className="border border-[#DFE1E7] rounded-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-base font-medium text-[#666d80] mb-2">No calls scheduled for today</p>
                  <p className="text-sm text-[#666d80]">Create a new call to get started.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="this-week" className="mt-0">
            <Card className="border border-[#DFE1E7] rounded-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-base font-medium text-[#666d80] mb-2">No calls scheduled for this week</p>
                  <p className="text-sm text-[#666d80]">Create a new call to get started.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-0">
            <Card className="border border-[#DFE1E7] rounded-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-base font-medium text-[#666d80] mb-2">No scheduled calls</p>
                  <p className="text-sm text-[#666d80]">Schedule your first call to get started.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <Card className="border border-[#DFE1E7] rounded-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-base font-medium text-[#666d80] mb-2">No completed calls</p>
                  <p className="text-sm text-[#666d80]">Completed calls will appear here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}


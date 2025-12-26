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
import { Phone, CalendarPlus } from "lucide-react"

type CallFilter = "all" | "scheduled" | "today" | "this-week" | "completed"

export default function MyCallsPage() {
  const [activeFilter, setActiveFilter] = useState<CallFilter>("all")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground leading-[1.35]">My Calls</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View call history and schedule upcoming calls
          </p>
        </div>
        <Button className="h-10 px-4 py-2 bg-primary border border-primary text-white rounded-lg hover:bg-primary/90">
          <CalendarPlus className="h-4 w-4 mr-2" />
          Schedule Call
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Total Calls
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">0</p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Today
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">0</p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            This Week
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">0</p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Completed
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">0</p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as CallFilter)}>
        <TabsList className="bg-muted p-0.5 rounded-xl h-auto border-0">
          <TabsTrigger
            value="all"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            All Calls
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            Upcoming
          </TabsTrigger>
          <TabsTrigger
            value="today"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            Today
          </TabsTrigger>
          <TabsTrigger
            value="this-week"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            This Week
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="mt-6">
          <TabsContent value="all" className="mt-0">
            <Card className="border border-border rounded-2xl">
              <CardHeader>
                <CardTitle>All Calls</CardTitle>
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
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center py-12">
                          <p className="text-base font-medium text-muted-foreground mb-2">No calls yet</p>
                          <p className="text-sm text-muted-foreground">All your calls (scheduled and completed) will appear here.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-0">
            <Card className="border border-border rounded-2xl">
              <CardHeader>
                <CardTitle>Upcoming Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center py-12">
                          <Phone className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                          <p className="text-base font-medium text-muted-foreground mb-2">No scheduled calls</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Schedule calls to manage your upcoming outreach activities.
                          </p>
                          <Button className="bg-primary text-white rounded-lg hover:bg-primary/90">
                            <CalendarPlus className="h-4 w-4 mr-2" />
                            Schedule Your First Call
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="today" className="mt-0">
            <Card className="border border-border rounded-2xl">
              <CardHeader>
                <CardTitle>Calls Today</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center py-12">
                          <p className="text-base font-medium text-muted-foreground mb-2">No calls scheduled for today</p>
                          <p className="text-sm text-muted-foreground">Calls happening today will appear here.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="this-week" className="mt-0">
            <Card className="border border-border rounded-2xl">
              <CardHeader>
                <CardTitle>This Week's Calls</CardTitle>
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
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center py-12">
                          <p className="text-base font-medium text-muted-foreground mb-2">No calls scheduled for this week</p>
                          <p className="text-sm text-muted-foreground">Calls scheduled this week will appear here.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <Card className="border border-border rounded-2xl">
              <CardHeader>
                <CardTitle>Call History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center py-12">
                          <p className="text-base font-medium text-muted-foreground mb-2">No completed calls</p>
                          <p className="text-sm text-muted-foreground">
                            View your call history here. Completed calls from external sources will appear automatically.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}


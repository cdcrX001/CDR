"use client"

import { useRef, useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { CreateRoomDialog } from "@/components/create-room-dialog"

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const activeRooms = [
    { id: 1, name: "Marketing Analytics", participants: 5, status: "Active", hasRequests: true },
    { id: 2, name: "Customer Segmentation", participants: 3, status: "Active", hasRequests: false },
    { id: 3, name: "Product Usage Insights", participants: 4, status: "Active", hasRequests: true },
    { id: 4, name: "Sales Performance", participants: 6, status: "Active", hasRequests: false },
    { id: 5, name: "User Behavior Analysis", participants: 4, status: "Active", hasRequests: true },
  ]

  const accessRequests = [
    { id: 1, company: "TechCorp", room: "Marketing Analytics", status: "Pending" },
    { id: 2, company: "DataInsights", room: "Customer Segmentation", status: "Approved" },
    { id: 3, company: "AnalyticsPro", room: "Product Usage Insights", status: "Rejected" },
    { id: 4, company: "MetricsMaster", room: "Sales Performance", status: "Pending" },
    { id: 5, company: "InsightFlow", room: "User Behavior Analysis", status: "Pending" },
  ]

  const popularRooms = [
    { id: 1, name: "Sales Performance", participants: 245 },
    { id: 2, name: "User Behavior Analysis", participants: 189 },
    { id: 3, name: "Inventory Optimization", participants: 156 },
    { id: 4, name: "Customer Feedback Analysis", participants: 134 },
    { id: 5, name: "Supply Chain Efficiency", participants: 98 },
  ]

  const scrollContainers = {
    activeRooms: useRef<HTMLDivElement>(null),
    accessRequests: useRef<HTMLDivElement>(null),
    popularRooms: useRef<HTMLDivElement>(null),
  }

  const scroll = (direction: "left" | "right", section: keyof typeof scrollContainers) => {
    const container = scrollContainers[section].current
    if (container) {
      const scrollAmount = direction === "left" ? -container.offsetWidth : container.offsetWidth
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Data Clean Room Dashboard</h1>

      <div className="grid grid-cols-1 gap-8">
        {/* Active Data Clean Rooms Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Active Data Clean Rooms</h2>
            <Button onClick={() => setDialogOpen(true)}>Create a new data clean room</Button>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="flex-shrink-0 rounded-full bg-background shadow-sm"
              onClick={() => scroll("left", "activeRooms")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="relative overflow-hidden">
              <div
                ref={scrollContainers.activeRooms}
                className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide"
              >
                {activeRooms.map((room) => (
                  <Card key={room.id} className="w-[300px] flex-shrink-0 snap-start relative flex flex-col">
                    {room.hasRequests && <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full" />}
                    <CardHeader>
                      <CardTitle>{room.name}</CardTitle>
                      <CardDescription>{room.participants} participants</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                      <Badge>{room.status}</Badge>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="flex-shrink-0 rounded-full bg-background shadow-sm"
              onClick={() => scroll("right", "activeRooms")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Customer Requests for Access Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Customer Requests for Access</h2>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="flex-shrink-0 rounded-full bg-background shadow-sm"
              onClick={() => scroll("left", "accessRequests")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="relative overflow-hidden">
              <div
                ref={scrollContainers.accessRequests}
                className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide"
              >
                {accessRequests.map((request) => (
                  <Card key={request.id} className="w-[300px] flex-shrink-0 snap-start flex flex-col">
                    <CardHeader>
                      <CardTitle>{request.company}</CardTitle>
                      <CardDescription>Requesting access to: {request.room}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                      <Badge
                        variant={
                          request.status === "Approved"
                            ? "default"
                            : request.status === "Rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {request.status}
                      </Badge>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="flex-shrink-0 rounded-full bg-background shadow-sm"
              onClick={() => scroll("right", "accessRequests")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Popular Public Rooms Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Popular Public Rooms</h2>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="flex-shrink-0 rounded-full bg-background shadow-sm"
              onClick={() => scroll("left", "popularRooms")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="relative overflow-hidden">
              <div
                ref={scrollContainers.popularRooms}
                className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide"
              >
                {popularRooms.map((room) => (
                  <Card key={room.id} className="w-[300px] flex-shrink-0 snap-start flex flex-col">
                    <CardHeader>
                      <CardTitle>{room.name}</CardTitle>
                      <CardDescription>{room.participants} participants</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                      <Badge variant="secondary">Popular</Badge>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="flex-shrink-0 rounded-full bg-background shadow-sm"
              onClick={() => scroll("right", "popularRooms")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>

      <CreateRoomDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </main>
  )
}


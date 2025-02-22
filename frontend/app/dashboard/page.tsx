"use client"

import { useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  TrendingUp,
  Plus,
  Activity,
  ArrowUpRight,
  BarChart3,
  Shield,
  UserPlus,
} from "lucide-react"
import { CreateRoomDialog } from "@/components/create-room-dialog"
import { motion } from "framer-motion"
import { useRouter } from 'next/navigation'
import { authState } from '@/lib/atoms'
// import { useRecoilValue } from 'recoil';
// auth context
import { useAuth } from '@/lib/AuthContext';

export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  // console.log(useRecoilValue(authState) )

  const { isAuthenticated } = useAuth();
  console.log(isAuthenticated)

  if (!isAuthenticated) {
    router.push('/')
  }


  const activeRooms = [
    {
      id: 1,
      name: "Marketing Analytics",
      participants: 5,
      status: "Active",
      hasRequests: true,
      activity: "High",
      dataPoints: "2.5M",
    },
    {
      id: 2,
      name: "Customer Segmentation",
      participants: 3,
      status: "Active",
      hasRequests: false,
      activity: "Medium",
      dataPoints: "1.2M",
    },
    {
      id: 3,
      name: "Product Usage Insights",
      participants: 4,
      status: "Active",
      hasRequests: true,
      activity: "High",
      dataPoints: "3.1M",
    },
    {
      id: 4,
      name: "Sales Performance",
      participants: 6,
      status: "Active",
      hasRequests: false,
      activity: "Low",
      dataPoints: "850K",
    },
    {
      id: 5,
      name: "User Behavior Analysis",
      participants: 4,
      status: "Active",
      hasRequests: true,
      activity: "Medium",
      dataPoints: "1.8M",
    },
  ]

  const accessRequests = [
    { id: 1, company: "TechCorp", room: "Marketing Analytics", status: "Pending", timeAgo: "2h ago", logo: "T" },
    { id: 2, company: "DataInsights", room: "Customer Segmentation", status: "Approved", timeAgo: "1d ago", logo: "D" },
    {
      id: 3,
      company: "AnalyticsPro",
      room: "Product Usage Insights",
      status: "Rejected",
      timeAgo: "3h ago",
      logo: "A",
    },
    { id: 4, company: "MetricsMaster", room: "Sales Performance", status: "Pending", timeAgo: "5h ago", logo: "M" },
    { id: 5, company: "InsightFlow", room: "User Behavior Analysis", status: "Pending", timeAgo: "1h ago", logo: "I" },
  ]

  const popularRooms = [
    { id: 1, name: "Sales Performance", participants: 245, growth: "+12%", queries: "25K" },
    { id: 2, name: "User Behavior Analysis", participants: 189, growth: "+8%", queries: "18K" },
    { id: 3, name: "Inventory Optimization", participants: 156, growth: "+15%", queries: "15K" },
    { id: 4, name: "Customer Feedback Analysis", participants: 134, growth: "+5%", queries: "12K" },
    { id: 5, name: "Supply Chain Efficiency", participants: 98, growth: "+10%", queries: "10K" },
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col gap-8 mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Data Clean Room Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">Manage and monitor your data clean rooms</p>
            </div>
            <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2 rounded-full">
              <Plus className="h-5 w-5" />
              Create Room
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[ 
              { label: "Total Active Rooms", value: "12", icon: Activity, trend: "+2 this week" },
              { label: "Total Participants", value: "156", icon: Users, trend: "+15 this month" },
              { label: "Data Points Processed", value: "8.6M", icon: BarChart3, trend: "+1.2M this week" },
              { label: "Pending Requests", value: "5", icon: UserPlus, trend: "3 new today" },
            ].map((stat, i) => (
              <Card key={i} className="border-muted-foreground/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {/* Active Data Clean Rooms Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Active Data Clean Rooms</h2>
              </div>
              <Button variant="ghost" className="gap-2 text-sm text-muted-foreground">
                View All <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0 rounded-full bg-background/50 backdrop-blur-sm shadow-sm hover:bg-background/80 transition-colors"
                onClick={() => scroll("left", "activeRooms")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="relative overflow-hidden rounded-2xl">
                <div
                  ref={scrollContainers.activeRooms}
                  className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide pb-4"
                >
                  {activeRooms.map((room) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="w-[320px] flex-shrink-0 snap-start relative flex flex-col hover:shadow-lg transition-all duration-300 border-muted-foreground/10 group">
                        {room.hasRequests && (
                          <span className="absolute top-3 right-3 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        )}
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {room.name}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {room.participants} participants
                              </span>
                              <span className="flex items-center gap-1">
                                <BarChart3 className="h-4 w-4" />
                                {room.dataPoints} points
                              </span>
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto flex justify-between items-center">
                          <Badge variant="outline" className="bg-primary/5">
                            {room.status}
                          </Badge>
                          <span
                            className={`text-sm ${
                              room.activity === "High"
                                ? "text-green-500"
                                : room.activity === "Medium"
                                  ? "text-yellow-500"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {room.activity} Activity
                          </span>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0 rounded-full bg-background/50 backdrop-blur-sm shadow-sm hover:bg-background/80 transition-colors"
                onClick={() => scroll("right", "activeRooms")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </section>

          {/* Customer Requests for Access Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Access Requests</h2>
              </div>
              <Button variant="ghost" className="gap-2 text-sm text-muted-foreground">
                View All <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0 rounded-full bg-background/50 backdrop-blur-sm shadow-sm hover:bg-background/80 transition-colors"
                onClick={() => scroll("left", "accessRequests")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="relative overflow-hidden rounded-2xl">
                <div
                  ref={scrollContainers.accessRequests}
                  className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide pb-4"
                >
                  {accessRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="w-[320px] flex-shrink-0 snap-start flex flex-col hover:shadow-lg transition-all duration-300 border-muted-foreground/10 group">
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {request.logo}
                            </div>
                            <div>
                              <CardTitle>{request.company}</CardTitle>
                              <CardDescription className="text-xs">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {request.timeAgo}
                              </CardDescription>
                            </div>
                          </div>
                          <CardDescription className="text-sm">Requesting access to: {request.room}</CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto flex justify-between items-center">
                          <Badge
                            variant={
                              request.status === "Approved"
                                ? "default"
                                : request.status === "Rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="bg-primary/5"
                          >
                            {request.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0 rounded-full bg-background/50 backdrop-blur-sm shadow-sm hover:bg-background/80 transition-colors"
                onClick={() => scroll("right", "accessRequests")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </section>

          {/* Popular Public Rooms Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Popular Public Rooms</h2>
              </div>
              <Button variant="ghost" className="gap-2 text-sm text-muted-foreground">
                View All <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0 rounded-full bg-background/50 backdrop-blur-sm shadow-sm hover:bg-background/80 transition-colors"
                onClick={() => scroll("left", "popularRooms")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="relative overflow-hidden rounded-2xl">
                <div
                  ref={scrollContainers.popularRooms}
                  className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide pb-4"
                >
                  {popularRooms.map((room) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="w-[320px] flex-shrink-0 snap-start flex flex-col hover:shadow-lg transition-all duration-300 border-muted-foreground/10 group">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {room.name}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {room.participants} participants
                              </span>
                              <span className="flex items-center gap-1">
                                <Activity className="h-4 w-4" />
                                {room.queries} queries
                              </span>
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto">
                          <Badge variant="secondary" className="bg-primary/5 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {room.growth} growth
                          </Badge>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0 rounded-full bg-background/50 backdrop-blur-sm shadow-sm hover:bg-background/80 transition-colors"
                onClick={() => scroll("right", "popularRooms")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        </div>

        <Button onClick={handleLogout} className="mt-4">Logout</Button>

        <CreateRoomDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    </main>
  )
} 
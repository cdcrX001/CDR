'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Room {
  id: number
  name: string
  description: string
  participants: number
}

const publicRooms: Room[] = [
  { id: 1, name: "Global Market Trends", description: "Analyze worldwide market trends and consumer behavior", participants: 1250 },
  { id: 2, name: "Healthcare Data Collaboration", description: "Collaborative research on anonymized patient data", participants: 890 },
  { id: 3, name: "Sustainable Supply Chain", description: "Optimize supply chains for sustainability and efficiency", participants: 567 },
  { id: 4, name: "Financial Fraud Detection", description: "Cross-institutional data sharing for fraud prevention", participants: 723 },
  { id: 5, name: "Smart City Planning", description: "Urban development insights from multiple data sources", participants: 456 },
  { id: 6, name: "E-commerce Customer Insights", description: "Aggregate customer behavior across platforms", participants: 1102 },
  { id: 7, name: "Climate Change Research", description: "Collaborative analysis of global climate data", participants: 789 },
  { id: 8, name: "Educational Outcomes", description: "Cross-institutional study on learning outcomes", participants: 345 },
  { id: 9, name: "Cybersecurity Threat Intelligence", description: "Shared data on emerging cyber threats", participants: 678 },
  { id: 10, name: "Agricultural Yield Optimization", description: "Data-driven insights for improving crop yields", participants: 234 },
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRooms = publicRooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Public Rooms</h1>
      
      <div className="max-w-3xl mx-auto space-y-6">
        <Input
          placeholder="Search public rooms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-6"
        />

        <div className="grid gap-4">
          {filteredRooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>
                  {room.description}
                  <br />
                  <span className="text-sm font-medium text-muted-foreground mt-2">
                    {room.participants} participants
                  </span>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
          {filteredRooms.length === 0 && (
            <p className="text-center text-muted-foreground">No rooms found matching your search.</p>
          )}
        </div>
      </div>
    </main>
  )
}


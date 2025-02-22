'use client'

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from '@/context/wallet-context'

const mockRooms = [
  { id: 1, name: "Marketing Analytics", lastAccessed: "2 hours ago" },
  { id: 2, name: "Customer Segmentation", lastAccessed: "1 day ago" },
  { id: 3, name: "Product Usage Insights", lastAccessed: "3 days ago" },
]

export default function HistoryPage() {
  const { address, connect } = useWallet()

  if (!address) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Connect Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view your room history
          </p>
          <Button onClick={connect}>Connect Wallet</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Your Room History</h1>
      
      {mockRooms.length > 0 ? (
        <div className="grid gap-4 max-w-2xl">
          {mockRooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>Last accessed: {room.lastAccessed}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No rooms found in your history
        </div>
      )}
    </main>
  )
}


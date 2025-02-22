'use client'

import React, { useState } from 'react'
import Button from '../components/ui/button'
import Card from '../components/ui/card'
import { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import Link from 'next/link'

// Mock data for the marketplace
const mockMarketplaceData = [
  {
    id: 1,
    name: "Healthcare Analytics Dataset",
    description: "Anonymized patient records for research",
    price: "0.5 ETH",
    provider: "HealthTech Labs"
  },
  {
    id: 2,
    name: "Financial Transaction Data",
    description: "Historical transaction patterns",
    price: "0.8 ETH",
    provider: "FinData Corp"
  },
  {
    id: 3,
    name: "Consumer Behavior Dataset",
    description: "Retail purchasing patterns",
    price: "0.3 ETH",
    provider: "RetailMetrics"
  }
]

export default function Home() {
  const [showMarketplace, setShowMarketplace] = useState(false)

  return (
    <div className="h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end h-16 items-center">
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowMarketplace(false)}
                className={!showMarketplace ? "text-blue-600" : "text-gray-600"}
              >
                Home
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowMarketplace(true)}
                className={showMarketplace ? "text-blue-600" : "text-gray-600"}
              >
                Marketplace
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex items-center justify-center h-[calc(100vh-4rem)] w-full px-4">
        {!showMarketplace ? (
          // Home Page Content
          <div className="flex flex-col items-center justify-center">
            <Card className="w-[600px] text-center">
              <CardHeader>
                <CardTitle className="text-3xl">Welcome to Data Clean Room</CardTitle>
                <CardDescription className="text-lg">
                  Create secure enclaves for your data analysis needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600">
                  Get started by creating your first data clean room enclave
                </p>
                <Link href="/create-enclave">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                    Create New Enclave
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Marketplace Content
          <div className="w-full max-w-7xl">
            <h2 className="text-2xl font-bold mb-6">Data Marketplace</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockMarketplaceData.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>{item.provider}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-600">{item.price}</span>
                      <Button>View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

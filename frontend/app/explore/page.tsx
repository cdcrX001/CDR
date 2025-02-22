'use client'

import { useEffect, useState } from 'react'
import { DatasetCard } from '@/components/dataset-card'

// Type definition matching backend response
interface MarketplaceItem {
  dataset_name: string
  description: string
  organization_name: string
  sample_queries: string[]
  rules: string
  isPublic: boolean
  enclave_id: string
}

export default function ExplorePage() {
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarketplaceItems = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/marketplace')
        if (!response.ok) {
          throw new Error('Failed to fetch marketplace items')
        }
        const data = await response.json()
        console.log(data)
        setMarketplaceItems(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchMarketplaceItems()
  }, [])

  const handleUseDataset = (enclaveId: string, name: string) => {
    console.log(`Using dataset ${name} with enclave ID ${enclaveId}`)
    // Implement your logic here
  }

  const handleRequestAccess = (enclaveId: string) => {
    console.log(`Requesting access to enclave ${enclaveId}`)
    // Implement your logic here
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Explore Data Enclaves</h1>
      
      {/* Available Datasets Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Available Datasets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplaceItems
            .filter(item => item.isPublic)
            .map((item) => (
              <DatasetCard
                key={item.enclave_id}
                item={item}
                expandedCard={expandedCard}
                setExpandedCard={setExpandedCard}
                onUse={() => handleUseDataset(item.enclave_id, item.dataset_name)}
                buttonText="Use"
              />
            ))}
        </div>
      </div>

      {/* Request Access Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Request Access Datasets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplaceItems
            .filter(item => !item.isPublic)
            .map((item) => (
              <DatasetCard
                key={item.enclave_id}
                item={item}
                expandedCard={expandedCard}
                setExpandedCard={setExpandedCard}
                onUse={() => handleRequestAccess(item.enclave_id)}
                buttonText="Request Access"
              />
            ))}
        </div>
      </div>
    </div>
  )
}


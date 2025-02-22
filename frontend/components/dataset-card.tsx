import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DatasetCardProps {
  item: MarketplaceItem
  expandedCard: string | null
  setExpandedCard: (id: string | null) => void
  onUse: () => void
  buttonText: string
}

interface MarketplaceItem {
  dataset_name: string
  description: string
  organization_name: string
  sample_queries: string[]
  rules: string
  isPublic: boolean
  enclave_id: string
}

export function DatasetCard({ item, expandedCard, setExpandedCard, onUse, buttonText }: DatasetCardProps) {
  const isExpanded = expandedCard === item.enclave_id

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer" 
      onClick={() => setExpandedCard(isExpanded ? null : item.enclave_id)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{item.dataset_name}</CardTitle>
          <Badge variant={item.isPublic ? "default" : "secondary"}>
            {item.isPublic ? "Public" : "Private"}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-500">
          {item.organization_name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{item.description}</p>
        
        {isExpanded && (
          <>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Sample Queries:</h4>
              <ul className="list-disc list-inside text-sm">
                {Array.isArray(item.sample_queries) && item.sample_queries.length > 0 ? (
                  item.sample_queries.slice(0, 2).map((query, idx) => (
                    <li key={idx} className="text-gray-600">{query}</li>
                  ))
                ) : (
                  <li className="text-gray-600">No sample queries available.</li>
                )}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Rules:</h4>
              <p className="text-sm text-gray-600">{item.rules}</p>
            </div>
          </>
        )}

        <div className="flex justify-end mt-4">
          <Button variant="outline" className="mr-2" onClick={(e) => {
            e.stopPropagation()
            setExpandedCard(isExpanded ? null : item.enclave_id)
          }}>
            {isExpanded ? "Show Less" : "Learn More"}
          </Button>
          <Button onClick={(e) => {
            e.stopPropagation()
            onUse()
          }}>
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 
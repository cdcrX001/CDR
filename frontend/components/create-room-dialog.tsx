'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
// Define an interface for dataset details
interface DatasetDetails {
  dataset_name: string;
  description: string;
  organization_name: string;
  sample_queries: string[];
  rules: string;
  isPublic: boolean;
  whitelistEmails: string[];
}

export function CreateRoomDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [keyPairGenerated, setKeyPairGenerated] = useState(false)
  const router = useRouter();

  // Use the DatasetDetails interface for state
  const [datasetDetails, setDatasetDetails] = useState<DatasetDetails>({
    dataset_name: '',
    description: '',
    organization_name: '',
    sample_queries: [],
    rules: '',
    isPublic: true,
    whitelistEmails: [],
  })

  const handleGenerateKeyPair = () => {
    setKeyPairGenerated(true)
  }
  async function saveDatasetDetails(enclaveId: string, details: DatasetDetails) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/save-dataset/${enclaveId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(details),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving dataset details:', error);
      return null;
    }
  }

  // Add type for the event in the form submission handler
    const handleDatasetSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const enclaveId = uuidv4(); // Generate a new enclave ID
      
      try {
          // First generate the CA with the same enclaveId
          const response = await fetch(`http://127.0.0.1:8000/generate-ca/${enclaveId}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
          });
  
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const enclaveResult = await response.json();
          
          // Then save the dataset details with the same enclaveId
          const result = await saveDatasetDetails(enclaveId, {
              ...datasetDetails,
              isPublic: datasetDetails.isPublic,
              whitelistEmails: datasetDetails.isPublic ? [] : datasetDetails.whitelistEmails
          });
          if (result) {
              toast.success('Dataset details saved successfully!');
              // setShowDatasetForm(false);
              // await fetchMarketplaceData(); // Refresh marketplace data
              router.push(`/explore`);
              // Reset form
              setDatasetDetails({
                  dataset_name: '',
                  description: '',
                  organization_name: '',
                  sample_queries: [],
                  rules: '',
                  isPublic: true,
                  whitelistEmails: [],
              });
          } else {
              toast.error('Failed to save dataset details');
          }
      } catch (error) {
          console.error('Error:', error);
          toast.error('Failed to complete the operation');
      }
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Data Clean Room</DialogTitle>
          <DialogDescription>
            Create and manage your data clean rooms
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleDatasetSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataset_name">Dataset Name</Label>
            <Input
              id="dataset_name"
              value={datasetDetails.dataset_name}
              onChange={(e) => setDatasetDetails({ ...datasetDetails, dataset_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={datasetDetails.description}
              onChange={(e) => setDatasetDetails({ ...datasetDetails, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization_name">Organization Name</Label>
            <Input
              id="organization_name"
              value={datasetDetails.organization_name}
              onChange={(e) => setDatasetDetails({ ...datasetDetails, organization_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sample_queries">Sample Queries (comma-separated)</Label>
            <Input
              id="sample_queries"
              value={datasetDetails.sample_queries.join(', ')}
              onChange={(e) => setDatasetDetails({ ...datasetDetails, sample_queries: e.target.value.split(',').map(q => q.trim()) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rules">Rules</Label>
            <Textarea
              id="rules"
              value={datasetDetails.rules}
              onChange={(e) => setDatasetDetails({ ...datasetDetails, rules: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={datasetDetails.isPublic}
              onCheckedChange={(checked) => 
                setDatasetDetails({ ...datasetDetails, isPublic: checked as boolean })
              }
            />
            <Label htmlFor="isPublic">Public Enclave</Label>
          </div>

          {!datasetDetails.isPublic && (
            <div className="space-y-2">
              <Label htmlFor="whitelist">Whitelist Emails (comma-separated)</Label>
              <Input
                id="whitelist"
                value={datasetDetails.whitelistEmails.join(', ')}
                onChange={(e) => setDatasetDetails({ 
                  ...datasetDetails, 
                  whitelistEmails: e.target.value.split(',').map(email => email.trim()) 
                })}
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            Create Data Clean Room
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


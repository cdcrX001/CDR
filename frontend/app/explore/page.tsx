'use client'

import { useEffect, useState } from 'react'
import { DatasetCard } from '@/components/dataset-card'
import forge from 'node-forge'
import { toast } from 'react-hot-toast'

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

  // Function to generate key pair and CSR
  async function generateKeyPairAndCSR(enclaveId: string, datasetName: string) {
    try {
      // 1️⃣ Generate RSA Key Pair (2048-bit)
      const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
      const userPrivateKey = keyPair.privateKey;
      const userPublicKey = keyPair.publicKey;

      // 2️⃣ Create CSR
      const csr = forge.pki.createCertificationRequest();
      csr.publicKey = userPublicKey;

      // 3️⃣ Set CSR Subject Details
      csr.setSubject([
        { name: 'commonName', value: datasetName },
        { name: 'organizationName', value: 'Example Corp' },
        { name: 'countryName', value: 'IN' }
      ]);

      // 4️⃣ Self-sign the CSR using the private key
      csr.sign(userPrivateKey);

      // 5️⃣ Convert CSR to PEM format
      const csrPem = forge.pki.certificationRequestToPem(csr);
      console.log("Generated CSR:\n", csrPem);

      // 6️⃣ Base64 encode the CSR
      const csrBase64 = btoa(csrPem);

      // 7️⃣ Send CSR and enclaveId to Backend for Signing
      const response = await fetch("http://127.0.0.1:8000/sign-csr/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          enclaveid: enclaveId,
          csr_pem: csrBase64 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { signed_cert } = await response.json();
      console.log("Received Signed Certificate:\n", signed_cert);
      toast.success('CSR signed successfully!');

      return { 
        privateKey: forge.pki.privateKeyToPem(userPrivateKey),
        certificate: signed_cert 
      };
    } catch (error) {
      console.error("Error in generateKeyPairAndCSR:", error);
      toast.error('Failed to generate key pair and CSR');
      throw error;
    }
  }

  // Update the handleUseDataset function
  const handleUseDataset = async (enclaveId: string, datasetName: string) => {
    console.log(`Using dataset: ${datasetName} with enclave ID: ${enclaveId}`);
    
    if (!datasetName) {
    console.log("Dataset name is required for CSR generation")
      toast.error('Dataset name is required for CSR generation');
      return;
    }

    try {
    console.log("Generating credentials for dataset: ", datasetName)
      const result = await generateKeyPairAndCSR(enclaveId, datasetName);
      if (result) {
        console.log('Generated Credentials:', result);
        toast.success('Successfully generated credentials for dataset access');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate credentials');
    }
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
                onUse={() => handleUseDataset(item.enclave_id, item.description)}
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


'use client'

import React, { useState, useEffect } from 'react'
import Button from '../components/ui/button'
import Card from '../components/ui/card'
import { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import Link from 'next/link'
import forge from 'node-forge'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'react-hot-toast'

// Add interface for marketplace item type
interface MarketplaceItem {
  id: number;
  name: string;
  description: string;
  price: string;
  provider: string;
  exampleQueries: string[];
  rules: string;
  enclave_id: string;
  isPublic: boolean;
}

// Add this type near your other interfaces
interface EnclaveResponse {
  message: string;
  enclaveid: string;
}

// Add this type for dataset details
interface DatasetDetails {
  dataset_name: string;
  description: string;
  organization_name: string;
  sample_queries: string[];
  rules: string;
  isPublic: boolean;
  whitelistEmails: string[];
}

// Remove mock data
// const mockMarketplaceData = [ ... ];

// Add this function before the Home component
async function generateEnclave(): Promise<EnclaveResponse | null> {
  try {
    const enclaveId = uuidv4(); // Generate a random enclave ID using UUID
    
    const response = await fetch(`http://127.0.0.1:8000/generate-ca/${enclaveId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating enclave:', error);
    return null;
  }
}

// Add this function to save dataset details
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

// Update the generateKeyPairAndCSR function to match the pattern of generateCSR
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

// Update the "Use" button click handler
const handleUseDataset = async (enclaveId: string, datasetName: string) => {
    try {
        const result = await generateKeyPairAndCSR(enclaveId, datasetName);
        if (result) {
            console.log('Generated Credentials:', result);
            toast.success('Successfully generated credentials for dataset access');
            // You might want to save these credentials or show them to the user
        }
    } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to generate credentials');
    }
};

const handleRequestAccess = async (enclaveId: string) => {
    const email = prompt("Please enter your email address to request access:");
    if (email) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/request-access/${enclaveId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.success('Access request sent successfully!');
        } catch (error) {
            console.error('Error requesting access:', error);
            toast.error('Failed to send access request');
        }
    }
};

export default function Home() {
  const [showMarketplace, setShowMarketplace] = useState(false)
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceItem[]>([])
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [datasetDetails, setDatasetDetails] = useState<DatasetDetails>({
    dataset_name: '',
    description: '',
    organization_name: '',
    sample_queries: [],
    rules: '',
    isPublic: true,
    whitelistEmails: [],
  });
  const [showDatasetForm, setShowDatasetForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to generate CSR
  async function generateCSR() {
    try {
      // 1️⃣ Generate RSA Key Pair (2048-bit)
      const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
      const userPrivateKey = keyPair.privateKey;
      const userPublicKey = keyPair.publicKey;

      // 2️⃣ Create CSR
      const csr = forge.pki.createCertificationRequest();
      csr.publicKey = userPublicKey;

      // 3️⃣ Set CSR Subject Details (Optional)
      csr.setSubject([
          { name: 'commonName', value: 'User Name' },
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

      // 7️⃣ Send CSR to Backend for Signing
      const response = await fetch("http://127.0.0.1:8000/sign-csr/", {
          method: "POST",
          headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
          },
          body: JSON.stringify({ csr_pem: csrBase64 })
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { signed_cert } = await response.json();
      console.log("Received Signed Certificate:\n", signed_cert);

      return { userPrivateKey, signed_cert };
    } catch (error) {
      console.error("Error in generateCSR:", error);
      throw error;
    }
  }

  // Fetch marketplace data from the backend
  async function fetchMarketplaceData() {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/marketplace/");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMarketplaceData(data);
    } catch (error) {
      console.error("Error fetching marketplace data:", error);
      toast.error("Failed to load marketplace data");
    } finally {
      setIsLoading(false);
    }
  }

  // Run the function when user clicks "Generate CSR"
  useEffect(() => {
    const button = document.getElementById("generateButton");
    if (button) {
      button.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default action
        generateCSR(); // Call the CSR generation function
      });
    }
    return () => {
      if (button) {
        button.removeEventListener("click", generateCSR);
      }
    };
  }, []);

  // Call fetchMarketplaceData when showMarketplace is true
  useEffect(() => {
    if (showMarketplace) {
      fetchMarketplaceData();
    }
  }, [showMarketplace]);

  // Add this handler function
  const handleGenerateEnclave = async () => {
    setIsGenerating(true);
    try {
      const result = await generateEnclave();
      if (result) {
        toast.success(`Enclave created successfully! ID: ${result.enclaveid}`);
        // You might want to store the enclave ID somewhere or use it for further operations
      } else {
        toast.error('Failed to create enclave');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create enclave');
    } finally {
      setIsGenerating(false);
    }
  };

  // Update the handleDatasetSubmit function
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
            setShowDatasetForm(false);
            await fetchMarketplaceData(); // Refresh marketplace data
            
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
    <div className="container mx-auto px-4 py-8">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="text-xl font-bold">Data Clean Room</div>
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowMarketplace(false)}
                className={`px-4 py-2 rounded ${
                  !showMarketplace 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Home
              </Button>
              <Button
                onClick={() => setShowMarketplace(true)}
                className={`px-4 py-2 rounded ${
                  showMarketplace 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Marketplace
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Add margin-top to account for fixed navbar */}
      <main className="mt-20">
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
                <div className="space-y-4">
                  <Button
                    id="generateButton"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg w-full"
                    onClick={generateCSR}
                  >
                    Generate CSR
                  </Button>
                  <Button
                    onClick={() => setShowDatasetForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg w-full"
                  >
                    Create New Enclave
                  </Button>
                </div>
              </CardContent>
            </Card>
            {showDatasetForm && (
              <form onSubmit={handleDatasetSubmit} className="mt-4">
                <div>
                  <label>Dataset Name:</label>
                  <input
                    type="text"
                    value={datasetDetails.dataset_name}
                    onChange={(e) => setDatasetDetails({ ...datasetDetails, dataset_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Description:</label>
                  <textarea
                    value={datasetDetails.description}
                    onChange={(e) => setDatasetDetails({ ...datasetDetails, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Organization Name:</label>
                  <input
                    type="text"
                    value={datasetDetails.organization_name}
                    onChange={(e) => setDatasetDetails({ ...datasetDetails, organization_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Sample Queries (comma-separated):</label>
                  <input
                    type="text"
                    value={datasetDetails.sample_queries.join(', ')}
                    onChange={(e) => setDatasetDetails({ ...datasetDetails, sample_queries: e.target.value.split(',').map(q => q.trim()) })}
                    required
                  />
                </div>
                <div>
                  <label>Rules:</label>
                  <textarea
                    value={datasetDetails.rules}
                    onChange={(e) => setDatasetDetails({ ...datasetDetails, rules: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={datasetDetails.isPublic}
                      onChange={() => setDatasetDetails({ ...datasetDetails, isPublic: !datasetDetails.isPublic })}
                    />
                    Public Enclave
                  </label>
                </div>
                {!datasetDetails.isPublic && (
                  <div>
                    <label>Whitelist Emails (comma-separated):</label>
                    <input
                      type="text"
                      value={datasetDetails.whitelistEmails.join(', ')}
                      onChange={(e) => setDatasetDetails({ ...datasetDetails, whitelistEmails: e.target.value.split(',').map(email => email.trim()) })}
                    />
                  </div>
                )}
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 mt-4">
                  Save Dataset Details
                </Button>
              </form>
            )}
          </div>
        ) : (
          // Marketplace Content
          <div>
            <h2 className="text-2xl font-bold mb-6">Marketplace</h2>
            
            {/* Available Datasets Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Available Datasets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplaceData
                  .filter(item => item.isPublic)
                  .map((item) => (
                    <DatasetCard
                      key={item.id}
                      item={item}
                      expandedCard={expandedCard}
                      setExpandedCard={setExpandedCard}
                      onUse={() => handleUseDataset(item.enclave_id, item.name)}
                      buttonText="Use"
                    />
                  ))}
              </div>
            </div>

            {/* Request Access Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Request Access Datasets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplaceData
                  .filter(item => !item.isPublic)
                  .map((item) => (
                    <DatasetCard
                      key={item.id}
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
        )}
      </main>
    </div>
  )
}

// Create a new DatasetCard component for reusability
interface DatasetCardProps {
  item: MarketplaceItem;
  expandedCard: number | null;
  setExpandedCard: (id: number | null) => void;
  onUse: () => void;
  buttonText: string;
}

function DatasetCard({ item, expandedCard, setExpandedCard, onUse, buttonText }: DatasetCardProps) {
  return (
    <div key={item.id} className="flex flex-col">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>{item.name}</CardTitle>
          <CardDescription>{item.provider}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{item.price}</p>
          <p className="text-gray-500 mb-2">Enclave ID: {item.enclave_id}</p>
          <div className="flex justify-between">
            <Button 
              onClick={() => setExpandedCard(expandedCard === item.id ? null : item.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full px-4 py-2 rounded"
            >
              {expandedCard === item.id ? 'Hide Details' : 'View Details'}
            </Button>
            <Button
              onClick={onUse}
              className={`${buttonText === 'Use' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white px-4 py-2 rounded ml-2`}
            >
              {buttonText}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Expandable Details Section */}
      {expandedCard === item.id && (
        <Card className="mt-2 border-t-4 border-blue-500">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Example Queries</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {item.exampleQueries.map((query, index) => (
                    <li key={index} className="text-gray-600">
                      <code className="bg-gray-100 px-2 py-1 rounded">{query}</code>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Rules</h3>
                <p className="text-gray-600">{item.rules}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


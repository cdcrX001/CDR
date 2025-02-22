from fastapi import APIRouter, HTTPException
from ...core.db import get_supabase  # Ensure you have this import for Supabase
from pydantic import BaseModel
from typing import List
import base64
import json
from datetime import datetime, timedelta
from cryptography import x509
from cryptography.hazmat.primitives import serialization, hashes
import subprocess

router = APIRouter()

# Create a model for the request body
class CSRRequest(BaseModel):
    enclaveid: str
    csr_pem: str

# Add this model for dataset details
class DatasetDetails(BaseModel):
    dataset_name: str
    description: str
    organization_name: str
    sample_queries: List[str]
    rules: str
    isPublic: bool
    whitelistEmails: List[str]

# Add this model for access requests
class RequestAccess(BaseModel):
    email: str

@router.post("/sign-csr/")
async def sign_csr(request: CSRRequest):
    """Sign CSR with enclave's CA private key"""
    try:
        enclaveid = request.enclaveid
        supabase = get_supabase()

        # Get CA paths from Supabase for this enclave
        result = supabase.table('enclave_mapping').select('private_key_path, certificate_path').eq('enclave_id', enclaveid).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail=f"No CA found for enclave {enclaveid}")
        
        ca_private_key_path, ca_cert_path = result.data[0]['private_key_path'], result.data[0]['certificate_path']

        # Decode the base64 encoded CSR
        csr_pem_decoded = base64.b64decode(request.csr_pem).decode('utf-8')
        csr = x509.load_pem_x509_csr(csr_pem_decoded.encode())

        # Load the CA private key and certificate for this enclave
        with open(ca_private_key_path, "rb") as key_file:
            ca_private_key = serialization.load_pem_private_key(key_file.read(), password=None)

        with open(ca_cert_path, "rb") as cert_file:
            ca_cert = x509.load_pem_x509_certificate(cert_file.read())

        # Sign CSR with the enclave's CA
        cert = (
            x509.CertificateBuilder()
            .subject_name(csr.subject)
            .issuer_name(ca_cert.subject)
            .public_key(csr.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(datetime.utcnow())
            .not_valid_after(datetime.utcnow() + timedelta(days=365))
            .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
            .sign(ca_private_key, hashes.SHA256())
        )

        return {"signed_cert": cert.public_bytes(serialization.Encoding.PEM).decode()}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error signing CSR: {str(e)}")

@router.get("/api/marketplace/", response_model=List[DatasetDetails])
async def get_marketplace_items():
    """Fetch marketplace items from Supabase"""
    try:
        supabase = get_supabase()
        result = supabase.table('dataset_details').select('*').execute()

        if not result.data:
            return []

        marketplace_items = []
        for row in result.data:
            item = DatasetDetails(
                dataset_name=row['dataset_name'],
                description=row['description'],
                organization_name=row['organization_name'],
                sample_queries=json.loads(row['sample_queries']),
                rules=row['rules'],
                isPublic=row['isPublic'],
                whitelistEmails=json.loads(row['whitelistEmails'])
            )
            marketplace_items.append(item)

        return marketplace_items

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching marketplace items: {str(e)}")

@router.post("/save-dataset/{enclaveid}")
async def save_dataset(enclaveid: str, details: DatasetDetails):
    """Save dataset details for the given enclaveid"""
    try:
        supabase = get_supabase()
        data = {
            "enclave_id": enclaveid,
            "dataset_name": details.dataset_name,
            "description": details.description,
            "organization_name": details.organization_name,
            "sample_queries": json.dumps(details.sample_queries),
            "rules": details.rules,
            "isPublic": details.isPublic,
            "whitelistEmails": json.dumps(details.whitelistEmails)
        }
        supabase.table('dataset_details').insert(data).execute()
        return {"message": "Dataset details saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving dataset details: {str(e)}")

@router.post("/request-access/{enclaveid}")
async def request_access(enclaveid: str, request: RequestAccess):
    """Handle access requests for a private enclave"""
    try:
        # Here you can implement logic to store the access request in Supabase
        print(f"Access request for enclave {enclaveid} from {request.email}")
        return {"message": "Access request received"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing access request: {str(e)}")

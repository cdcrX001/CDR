from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import base64
from pydantic import BaseModel
from typing import List
import os
import subprocess
import sqlite3
from contextlib import contextmanager
import json
from datetime import datetime, timedelta

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

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can specify the allowed origins here
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

CA_CERT = "C:/Users/LENOVO/tools/CDR/Backend/ca_certificate.pem"
CA_KEY = "C:/Users/LENOVO/tools/CDR/Backend/ca_private.pem"

# Sample data structure for marketplace items
class MarketplaceItem(BaseModel):
    id: int
    name: str
    description: str
    price: str
    provider: str
    exampleQueries: List[str]
    rules: str
    enclave_id: str
    isPublic: bool

# Database path
DB_PATH = 'Backend/enclave_mapping.db'

def init_db():
    """Initialize the SQLite database and create tables if they do not exist."""
    # Ensure the Backend directory exists
    os.makedirs('Backend', exist_ok=True)

    with sqlite3.connect(DB_PATH) as conn:
        # Create enclave_mapping table
        conn.execute('''
        CREATE TABLE IF NOT EXISTS enclave_mapping (
            enclave_id TEXT PRIMARY KEY,
            private_key_path TEXT NOT NULL,
            certificate_path TEXT NOT NULL
        );
        ''')

        # Create dataset_details table
        conn.execute('''
        CREATE TABLE IF NOT EXISTS dataset_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            enclave_id TEXT NOT NULL,
            dataset_name TEXT NOT NULL,
            description TEXT NOT NULL,
            organization_name TEXT NOT NULL,
            sample_queries TEXT NOT NULL,
            rules TEXT NOT NULL,
            isPublic BOOLEAN NOT NULL,
            whitelistEmails TEXT NOT NULL,
            FOREIGN KEY (enclave_id) REFERENCES enclave_mapping (enclave_id)
        );
        ''')

# Call the init_db function when the application starts
@app.on_event("startup")
def startup_event():
    init_db()

@contextmanager
def get_db():
    """Context manager for database connections"""
    # Ensure the Backend directory exists
    os.makedirs('Backend', exist_ok=True)
    
    db_path = 'Backend/enclave_mapping.db'
    conn = sqlite3.connect(db_path)
    try:
        yield conn
    finally:
        conn.close()

@app.post("/sign-csr/")
async def sign_csr(request: CSRRequest):
    """Sign CSR with enclave's CA private key"""
    print(request)
    try:
        # Get the enclave ID from the request
        enclaveid = request.enclaveid

        # Get CA paths from database for this enclave
        with get_db() as conn:
            result = conn.execute(
                "SELECT private_key_path, certificate_path FROM enclave_mapping WHERE enclave_id = ?",
                (enclaveid,)
            ).fetchone()
            
            if not result:
                raise HTTPException(
                    status_code=404,
                    detail=f"No CA found for enclave {enclaveid}"
                )
            
            ca_private_key_path, ca_cert_path = result

        # Decode the base64 encoded CSR
        csr_pem_decoded = base64.b64decode(request.csr_pem).decode('utf-8')
        csr = x509.load_pem_x509_csr(csr_pem_decoded.encode())

        # Load the CA private key and certificate for this enclave
        with open(ca_private_key_path, "rb") as key_file:
            ca_private_key = serialization.load_pem_private_key(
                key_file.read(),
                password=None
            )

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
            .not_valid_after(
                datetime.utcnow() + timedelta(days=365)
            )
            .add_extension(
                x509.BasicConstraints(ca=False, path_length=None),
                critical=True
            )
            .sign(ca_private_key, hashes.SHA256())
        )

        # Return the signed certificate
        return {
            "signed_cert": cert.public_bytes(
                serialization.Encoding.PEM
            ).decode()
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error signing CSR: {str(e)}"
        )

@app.get("/api/marketplace/", response_model=List[MarketplaceItem])
async def get_marketplace_items():
    """Fetch marketplace items from dataset_details table"""
    try:
        with get_db() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT 
                    id,
                    dataset_name as name,
                    description,
                    organization_name as provider,
                    sample_queries,
                    rules,
                    enclave_id,
                    isPublic
                FROM dataset_details
            """)
            
            rows = cursor.fetchall()
            marketplace_items = []
            
            for row in rows:
                row_dict = dict(row)
                sample_queries = json.loads(row_dict['sample_queries'])
                
                item = MarketplaceItem(
                    id=row_dict['id'],
                    name=row_dict['name'],
                    description=row_dict['description'],
                    price="Contact Provider",
                    provider=row_dict['provider'],
                    exampleQueries=sample_queries,
                    rules=row_dict['rules'],
                    enclave_id=row_dict['enclave_id'],
                    isPublic=row_dict['isPublic']
                )
                marketplace_items.append(item)
                
            return marketplace_items
            
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/generate-ca/{enclaveid}")
async def generate_ca(enclaveid: str):
    """Generate CA private key and self-signed certificate for the given enclaveid"""
    try:
        # Define file paths
        private_key_path = f"Backend/{enclaveid}_ca_private.pem"
        certificate_path = f"Backend/{enclaveid}_ca_certificate.pem"

        # Generate private key
        subprocess.run(["openssl", "genrsa", "-out", private_key_path, "2048"], check=True)

        # Generate self-signed certificate
        subprocess.run([
            "openssl", "req", "-x509", "-new", "-nodes", "-key", private_key_path,
            "-sha256", "-days", "3650", "-out", certificate_path,
            "-subj", f"/CN={enclaveid}"
        ], check=True)

        # Store the mapping in the database
        with get_db() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO enclave_mapping (enclave_id, private_key_path, certificate_path) VALUES (?, ?, ?)",
                (enclaveid, private_key_path, certificate_path)
            )
            conn.commit()

        return {"message": "CA generated successfully", "enclaveid": enclaveid}

    except subprocess.CalledProcessError as e:
        # Clean up files if they were created
        for path in [private_key_path, certificate_path]:
            if os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=f"Error generating CA: {str(e)}")
    except sqlite3.Error as e:
        # Clean up files if they were created
        for path in [private_key_path, certificate_path]:
            if os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Add a helper function to get CA paths for an enclave
def get_ca_paths(enclaveid: str):
    """Get the CA certificate and private key paths for an enclave"""
    with get_db() as conn:
        result = conn.execute(
            "SELECT private_key_path, certificate_path FROM enclave_mapping WHERE enclave_id = ?",
            (enclaveid,)
        ).fetchone()
        
        if result is None:
            raise HTTPException(status_code=404, detail=f"No CA found for enclave {enclaveid}")
        
        return {"private_key": result[0], "certificate": result[1]}

@app.post("/save-dataset/{enclaveid}")
async def save_dataset(enclaveid: str, details: DatasetDetails):
    """Save dataset details for the given enclaveid"""
    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO dataset_details (enclave_id, dataset_name, description, organization_name, sample_queries, rules, isPublic, whitelistEmails) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (enclaveid, details.dataset_name, details.description, details.organization_name, json.dumps(details.sample_queries), details.rules, details.isPublic, json.dumps(details.whitelistEmails))
            )
            conn.commit()
        return {"message": "Dataset details saved successfully"}
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/request-access/{enclaveid}")
async def request_access(enclaveid: str, request: RequestAccess):
    """Handle access requests for a private enclave"""
    try:
        # Here you can implement logic to store the access request
        # For example, you could save it to a database or send an email notification
        print(f"Access request for enclave {enclaveid} from {request.email}")
        return {"message": "Access request received"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing access request: {str(e)}")

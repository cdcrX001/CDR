from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import base64
import httpx
from pydantic import BaseModel
from typing import List
import os
import subprocess
import sqlite3
from contextlib import contextmanager
import json
from datetime import datetime, timedelta
import time

# Create a model for the request body
class CSRRequest(BaseModel):
    enclaveid: str
    csr_pem: str


class RegisterUserRequest(BaseModel):
    signed_cert: str
    public_key: str
    enclaveid: str


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

        # Read the certificate and strip any extra whitespace/newlines
        with open(certificate_path, "rb") as cert_file:
            signed_cert = cert_file.read().decode('utf-8').strip()  # Use strip() to remove extra newlines

        # Read the template_index.js
        with open("app/template_index.js", "r") as template_file:
            template_content = template_file.read()

        # Replace the placeholder with the actual certificate
        updated_content = template_content.replace("{{caCertPem}}", signed_cert.replace("\n", ""))

        # Write the updated content to index.js
        with open("test/test-enclave/hello-enclave/index.js", "w") as index_file:
            index_file.write(updated_content)

        # Store the mapping in the database
        with get_db() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO enclave_mapping (enclave_id, private_key_path, certificate_path) VALUES (?, ?, ?)",
                (enclaveid, private_key_path, certificate_path)
            )
            conn.commit()



        # open the package.json file and change the name to the enclaveid
        with open("app/package_template.json", "r") as package_file:
            package_content = package_file.read()
        package_content = package_content.replace("{{enclaveid}}", enclaveid)
        with open("test/test-enclave/hello-enclave/package.json", "w") as package_file:
            package_file.write(package_content)

        # even get the package-lock.json file and change the name to the enclaveid
        with open("app/package-lock_template.json", "r") as package_lock_file:
            package_lock_content = package_lock_file.read()
        package_lock_content = package_lock_content.replace("{{enclaveid}}", enclaveid)
        with open("test/test-enclave/hello-enclave/package-lock.json", "w") as package_lock_file:
            package_lock_file.write(package_lock_content)



        # i want to see the current directory using subprocess
        print("Current directory:")
        result = subprocess.run(["pwd"], capture_output=True, text=True)
        print(result.stdout)
        
        # Change directory using os.chdir instead of subprocess
        os.chdir("test/test-enclave/hello-enclave")
        result = subprocess.run(["pwd"], capture_output=True, text=True)
        print(result.stdout)
        
        print("starting to build enclave" , enclaveid)
        command = ["ev", "enclave", "init", "-f", "Dockerfile", "--name", enclaveid, "--egress"]
        print(command)
        result = subprocess.run(command)
        print("this came here " , result.stdout)
        subprocess.run(["ev", "enclave", "build", "-v", "--output", "."])
        subprocess.run(["ev", "enclave", "deploy", "-v", "--eif-path", "./enclave.eif"])

        # Change back to original directory
        os.chdir("../..")

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
    










@app.post("/register-user/")
async def register_user( request: RegisterUserRequest):
    """Register user with enclave and get an encrypted key"""
    try:
        # Print the request body
        # Prepare the data to send to the external endpoint
        #  would be sent as base64 encoded string
        
        signed_cert = request.signed_cert
        public_key = request.public_key
        
        # decode the base64 encoded string
        signed_cert = base64.b64decode(signed_cert).decode('utf-8')
        public_key = base64.b64decode(public_key).decode('utf-8')
        
        data = {
            "signed_cert": signed_cert,
            "public_key": public_key
        }
        

        # https://{enclaveid}.app-73f7d14326e6.enclave.evervault.com


        # Send the request to the external endpoint
        async with httpx.AsyncClient() as client:
            response = await client.post(f"https://{request.enclaveid}.app-73f7d14326e6.enclave.evervault.com/register-user", json=data)
            response.raise_for_status()  # Raise an error for bad responses

        
        # Return the encrypted key received from the external service
        return response.json()

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Error registering user: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing registration: {str(e)}")

@app.post("/process-query/")
async def process_query(encrypted_query: str, signed_query: str , enclaveid: str):
    """Process the encrypted query and signed query"""
    try:
        # Prepare the data to send to the external endpoint
        data = {
            "encrypted_query": encrypted_query,
            "signed_query": signed_query,
        }

        # Send the request to the external endpoint
        async with httpx.AsyncClient() as client:
            response = await client.post(f"https://{enclaveid}.app-73f7d14326e6.enclave.evervault.com/process-query", json=data)
            response.raise_for_status()  # Raise an error for bad responses

        # Return the response from the external service
        return response.json()

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Error processing query: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")
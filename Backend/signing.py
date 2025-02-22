from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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

@app.post("/sign-csr/")
async def sign_csr(csr_pem: str):
    """Sign CSR with CA's private key"""
    try:
        csr = x509.load_pem_x509_csr(csr_pem.encode())

        with open(CA_KEY, "rb") as key_file:
            ca_private_key = serialization.load_pem_private_key(key_file.read(), password=None)

        with open(CA_CERT, "rb") as cert_file:
            ca_cert = x509.load_pem_x509_certificate(cert_file.read())

        # Sign CSR
        cert = (
            x509.CertificateBuilder()
            .subject_name(csr.subject)
            .issuer_name(ca_cert.subject)
            .public_key(csr.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(x509.datetime.datetime.utcnow())
            .not_valid_after(x509.datetime.datetime.utcnow() + x509.datetime.timedelta(days=365))
            .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
            .sign(ca_private_key, hashes.SHA256())
        )

        return {"signed_cert": cert.public_bytes(serialization.Encoding.PEM).decode()}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

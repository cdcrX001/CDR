# Confidential Data room (CDR)

## Overview
In today’s digital landscape, organizations struggle to collaborate on datasets due to stringent compliance requirements and security concerns. While modern security controls focus on encrypting data at rest and in transit, they fail to protect data **while in use**. This gap prevents organizations from leveraging joint data insights without risking data breaches or regulatory violations.

**Confidential Data Room (CDR)** solves this challenge by enabling organizations to collaborate securely on their datasets without compromising data confidentiality, integrity, or ownership. Our solution leverages **confidential computing, enclave-based encryption, and cryptographic verification** to ensure end-to-end security during data processing.

---
## 🔥 Key Features

✅ **Confidential Computing:** Protects data while in use through a secure enclave-based approach.
✅ **Zero Trust Architecture:** Each data request is authenticated, signed, and encrypted, ensuring only authorized queries are executed.
✅ **Dynamic Key Exchange:** Secure per-user key generation and mapping to maintain encrypted sessions.
✅ **Regulatory Compliance:** Supports compliance with GDPR, HIPAA, and other data privacy standards by preventing unauthorized access.
✅ **Scalable & Modular:** Easily integrates with existing enterprise security and data pipelines.

---
## 🚀 How It Works
1️⃣ **Enclave Creation:** The owner initializes a secure enclave, generating a **CA certificate and private key** for signing user certificates (**These cert and private key are stored in HSM/Credential manager**)

<img width="583" alt="image" src="https://github.com/user-attachments/assets/835f84ac-8a88-43e7-8785-59804736a826" />


2️⃣ **User Registration & Authentication:**
   - The user generates a key pair (**U_priv, U_pub**).
   - The UI creates a CSR for **U_pub** and sends it to the backend.
   - The backend **signs the CSR** using the enclave's **CA private key** stored in HSM, issuing **Cert_U** to the user.
   
3️⃣ **Secure Key Exchange:**
   - The user sends **(U_pub, Cert_U)** to the enclave.
   - The enclave **verifies Cert_U** using the stored **CA certificate**.
   - The enclave generates a **new key pair (E_priv, E_pub)** mapped to **U_pub**.
   - The enclave encrypts **E_pub** using **U_pub** and returns it to the user.

4️⃣ **Secure Query Execution:**
   - The user encrypts the query using **E_pub**, signs it with **U_priv**, and sends it to the enclave.
   - The enclave verifies the signature, decrypts the query, and executes it against the dataset.
   - The result is encrypted using **U_pub** and sent back to the user.
   - The user decrypts the response using **U_priv**.

---
## 🛠️ Tech Stack
- **FastAPI / Express.js** – API Backend
- **Intel SGX / AMD SEV** – Secure Enclave for Confidential Computing
- **Cryptography Libraries** – RSA, x509 Certificates, Digital Signatures
- **Multi-Party Computation (MPC)** – (Optional) Enhancing security for federated learning
- **Docker & Kubernetes** – Containerization & Scalability
- **Azure Confidential Computing / AWS Nitro Enclaves** – Secure execution environment

---
## 📌 Use Cases
🔹 **Financial Data Collaboration** – Securely process and analyze financial transactions between banks.
🔹 **Healthcare Research** – Enable hospitals to collaborate on patient data insights without exposing sensitive medical records.
🔹 **Supply Chain Optimization** – Protect supplier data while optimizing logistics and inventory management.
🔹 **Federated Learning** – Train AI models across multiple organizations without sharing raw datasets.

---
## 🔒 Security & Compliance
✅ **End-to-End Encryption:** Data is encrypted during transmission, storage, and processing.
✅ **Certificate-Based Authentication:** Ensures only verified users can interact with the enclave.
✅ **Tamper-Resistant Enclave:** Confidential data remains protected even if the host OS is compromised.
✅ **Audit Logging & Access Control:** Monitors data access and enforces least-privilege principles.

---
## 📢 Getting Started
### Prerequisites
- Python 3.9+ (for FastAPI) or Node.js (for Express.js)
- Docker (for containerized deployment)
- OpenSSL (for certificate generation)

### Installation
Clone the repository and install dependencies:
```sh
# Clone the repository
git clone https://github.com/yourrepo/cdr.git
cd cdr

# Install dependencies
pip install -r requirements.txt  # If using FastAPI
npm install                      # If using Express.js
```

### Running the Enclave Server
```sh
# Start the backend (FastAPI Example)
cd backend
uvicorn signing:app --host 0.0.0.0 --port 8000

# Start the backend (Express.js Example)
cd frontend
npm start
```
---
## 🤝 Contributing
We welcome contributions from the open-source community! If you have ideas or improvements, feel free to **open an issue** or **submit a pull request**.

---
## 📜 License
This project is licensed under the **MIT License**.

---
## 📬 Contact
For any inquiries, feel free to reach out:
📧 **Email:** cdcr3001@gmail.com  
📌 **GitHub:** [github.com/yourrepo](https://github.com/cdcrX001/CDR/)

---
**Empowering secure data collaboration – because your data should remain yours, even in use!** 🚀

const express = require("express");
const bodyParser = require("body-parser");
const forge = require("node-forge");
const base64url = require("base64url");

const app = express();
app.use(bodyParser.json());

// In-memory storage (should use a DB in production)
const userKeyMap = {}; // Maps U_pub to { E_priv, E_pub }
const caCertPem = `-----BEGIN CERTIFICATE-----
MIIDPzCCAiegAwIBAgI...
-----END CERTIFICATE-----`; // Store CA cert securely

/**
 * Verify Cert_U against the CA certificate.
 * Returns the verified U_pub key.
 */
function verifyCertificate(certPem) {
    const caCert = forge.pki.certificateFromPem(caCertPem);
    const userCert = forge.pki.certificateFromPem(certPem);

    try {
        // Verify signature using CA public key
        userCert.verify(caCert);
        return userCert.publicKey;
    } catch (error) {
        throw new Error("Certificate verification failed");
    }
}

/**
 * Generate an RSA keypair.
 */
function generateKeyPair() {
    return forge.pki.rsa.generateKeyPair({ bits: 2048 });
}

/**
 * Encrypt data using a given public key.
 */
function encryptWithPublicKey(publicKey, data) {
    return base64url.encode(
        publicKey.encrypt(data, "RSA-OAEP", {
            md: forge.md.sha256.create(),
            mgf1: forge.md.sha256.create(),
        })
    );
}

/**
 * Decrypt data using a given private key.
 */
function decryptWithPrivateKey(privateKey, encryptedData) {
    return privateKey.decrypt(base64url.toBuffer(encryptedData), "RSA-OAEP", {
        md: forge.md.sha256.create(),
        mgf1: forge.md.sha256.create(),
    });
}

/**
 * Verify a signature using a public key.
 */
function verifySignature(publicKey, signature, data) {
    const md = forge.md.sha256.create();
    md.update(data, "utf8");
    return publicKey.verify(md.digest().bytes(), base64url.toBuffer(signature));
}

/**
 * Register user: Step 4 & 5
 */
app.post("/register-user", (req, res) => {
    try {
        const { U_pub_pem, Cert_U } = req.body;

        // Verify certificate
        const verifiedU_pub = verifyCertificate(Cert_U);

        // Generate enclave keypair (E_priv, E_pub)
        const { publicKey: E_pub, privateKey: E_priv } = generateKeyPair();

        // Store user mapping
        userKeyMap[U_pub_pem] = { E_priv, E_pub };

        // Encrypt E_pub using U_pub and return it
        const U_pub = forge.pki.publicKeyFromPem(U_pub_pem);
        const encrypted_E_pub = encryptWithPublicKey(
            U_pub,
            forge.pki.publicKeyToPem(E_pub)
        );

        res.json({ encrypted_E_pub });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * Process user query: Step 9
 */
app.post("/process-query", (req, res) => {
    try {
        const { encrypted_query, signed_query } = req.body;

        for (const [U_pub_pem, { E_priv, E_pub }] of Object.entries(userKeyMap)) {
            const U_pub = forge.pki.publicKeyFromPem(U_pub_pem);

            // Verify signature
            if (!verifySignature(U_pub, signed_query, encrypted_query)) {
                continue; // Try the next U_pub
            }

            // Decrypt query
            const decrypted_query = decryptWithPrivateKey(E_priv, encrypted_query);

            // 🔹 Process the query against enclave dataset (Placeholder)
            const response = `Processed query: ${decrypted_query}`;

            // Encrypt response using U_pub
            const encrypted_response = encryptWithPublicKey(U_pub, response);

            return res.json({ encrypted_response });
        }

        res.status(403).json({ error: "User verification failed" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Enclave running on port ${PORT}`);
});
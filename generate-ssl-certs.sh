#!/bin/bash

# Generate SSL certificates for TGD Memory application
# This script creates self-signed certificates for development/testing

SSL_DIR="./nginx/ssl"
CERT_FILE="$SSL_DIR/cert.pem"
KEY_FILE="$SSL_DIR/key.pem"

# Create SSL directory if it doesn't exist
mkdir -p "$SSL_DIR"

# Check if certificates already exist
if [[ -f "$CERT_FILE" && -f "$KEY_FILE" ]]; then
    echo "SSL certificates already exist in $SSL_DIR"
    echo "Remove them manually if you want to regenerate."
    exit 0
fi

echo "Generating self-signed SSL certificates..."

# Generate private key
openssl genrsa -out "$KEY_FILE" 2048

# Generate certificate signing request
openssl req -new -key "$KEY_FILE" -out "$SSL_DIR/cert.csr" -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -days 365 -in "$SSL_DIR/cert.csr" -signkey "$KEY_FILE" -out "$CERT_FILE"

# Set appropriate permissions
chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"

# Clean up CSR file
rm "$SSL_DIR/cert.csr"

echo "SSL certificates generated successfully:"
echo "  Certificate: $CERT_FILE"
echo "  Private Key: $KEY_FILE"
echo ""
echo "⚠️  IMPORTANT: These are self-signed certificates for development only!"
echo "   For production, use certificates from a trusted Certificate Authority."
echo ""
echo "To use with Docker Compose:"
echo "  docker-compose --profile nginx up -d"

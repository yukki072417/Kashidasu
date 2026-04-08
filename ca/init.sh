#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CERT_DIR="$SCRIPT_DIR/../certs"

mkdir -p "$CERT_DIR"

echo "=== Creating CA ==="
openssl genrsa -out "$CERT_DIR/ca.key" 2048

openssl req -x509 -new -nodes \
  -key "$CERT_DIR/ca.key" \
  -sha256 -days 3650 \
  -out "$CERT_DIR/ca.crt" \
  -subj "/CN=LocalDevCA"

echo "=== Creating server certificate ==="
openssl genrsa -out "$CERT_DIR/server.key" 2048

openssl req -new \
  -key "$CERT_DIR/server.key" \
  -out "$CERT_DIR/server.csr" \
  -config "$SCRIPT_DIR/openssl.cnf"

openssl x509 -req \
  -in "$CERT_DIR/server.csr" \
  -CA "$CERT_DIR/ca.crt" \
  -CAkey "$CERT_DIR/ca.key" \
  -CAcreateserial \
  -out "$CERT_DIR/server.crt" \
  -days 365 \
  -sha256 \
  -extfile "$SCRIPT_DIR/openssl.cnf" \
  -extensions req_ext

echo "完了: $CERT_DIR"

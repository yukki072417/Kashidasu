#!/bin/sh
set -e

# スクリプトのあるディレクトリ取得
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

CERT_DIR="$SCRIPT_DIR/../certs"
OPENSSL_CNF="$SCRIPT_DIR/openssl.cnf"

mkdir -p "$CERT_DIR"

# =========================
# CA証明書生成
# =========================
if [ ! -f "$CERT_DIR/ca.crt" ]; then
  echo "Generating CA..."
  openssl genrsa -out "$CERT_DIR/ca.key" 2048
  openssl req -x509 -new -nodes \
    -key "$CERT_DIR/ca.key" \
    -sha256 -days 3650 \
    -out "$CERT_DIR/ca.crt" \
    -subj "/CN=LocalCA"
fi

generate_certificate() {
  NAME=$1

  echo "Generating certificate for $NAME"

  openssl genrsa -out "$CERT_DIR/$NAME.key" 2048

  openssl req -new \
    -key "$CERT_DIR/$NAME.key" \
    -out "$CERT_DIR/$NAME.csr" \
    -config "$OPENSSL_CNF"

  openssl x509 -req \
    -in "$CERT_DIR/$NAME.csr" \
    -CA "$CERT_DIR/ca.crt" \
    -CAkey "$CERT_DIR/ca.key" \
    -CAcreateserial \
    -out "$CERT_DIR/$NAME.crt" \
    -days 365 \
    -sha256 \
    -extfile "$OPENSSL_CNF" \
    -extensions req_ext
}

sh "$SCRIPT_DIR/secretKey.sh"

if [ ! -f "$CERT_DIR/server.crt" ]; then
  generate_certificate "server"
fi

echo "CAおよびSAN設定付きサーバ証明書の生成が完了しました."

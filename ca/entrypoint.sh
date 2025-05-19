#!/bin/sh
cd /root/ca
mkdir -p certs

# CA証明書の生成（存在しなければ）
if [ ! -f certs/ca.crt ]; then
  openssl genrsa -out certs/ca.key 2048
  openssl req -x509 -new -nodes -key certs/ca.key -sha256 -days 3650 -out certs/ca.crt -subj "/CN=LocalCA"
fi

# SAN付きサーバ証明書発行関数
generate_certificate() {
  openssl genrsa -out certs/$1.key 2048
  openssl req -new -key certs/$1.key -out certs/$1.csr -subj "/CN=$1"
  openssl x509 -req -in certs/$1.csr \
    -CA certs/ca.crt \
    -CAkey certs/ca.key \
    -CAcreateserial \
    -out certs/$1.crt \
    -days 365 \
    -extfile openssl.cnf \
    -extensions req_ext
}

# サーバ証明書の生成（存在しなければ）
if [ ! -f certs/server.crt ]; then
  generate_certificate "server"
fi

echo "CAおよびSAN設定付きサーバ証明書の生成が完了しました."
exec "$@"

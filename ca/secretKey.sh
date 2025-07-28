#!/bin/sh

# certsディレクトリが存在しない場合は作成
CERTS_DIR="./certs"
if [ ! -d "$CERTS_DIR" ]; then
    mkdir -p "$CERTS_DIR"
    echo "ディレクトリ $CERTS_DIR を作成しました。"
fi

# RSA秘密鍵が存在しない場合のみ生成
if [ ! -f "$CERTS_DIR/rsa_private.pem" ]; then
    openssl genrsa -out "$CERTS_DIR/rsa_private.pem" 2048
    echo "RSA秘密鍵を $CERTS_DIR/rsa_private.pem に生成しました。"
fi

# RSA公開鍵が存在しない場合のみ生成
if [ ! -f "$CERTS_DIR/rsa_public.pem" ]; then
    openssl rsa -in "$CERTS_DIR/rsa_private.pem" -pubout -out "$CERTS_DIR/rsa_public.pem"
    echo "RSA公開鍵を $CERTS_DIR/rsa_public.pem に生成しました。"
fi
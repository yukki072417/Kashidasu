#!/bin/bash

# ../certs ディレクトリが存在しない場合は作成
CERTS_DIR="/usr/app/certs/"
if [ ! -d "$CERTS_DIR" ]; then
    mkdir -p "$CERTS_DIR"
    echo "ディレクトリ $CERTS_DIR を作成しました。"
fi

# 32文字のランダムなキーを生成して保存
ENCRYPTION_KEY=$(openssl rand -hex 16)
echo "$ENCRYPTION_KEY" > "$CERTS_DIR/encryption.key"
echo "暗号化キーを $CERTS_DIR/encryption.key に保存しました。"
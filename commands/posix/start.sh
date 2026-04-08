#!/bin/bash

# 色設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# このスクリプトのディレクトリ
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# プロジェクトルート（commands/posix から 2 階層上）
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

CERT_DIR="$ROOT_DIR/certs"
CA_INIT="$ROOT_DIR/ca/init.sh"
ENV_FILE="$ROOT_DIR/.env"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Kashidasu 図書館管理システム${NC}"
echo -e "${BLUE}  POSIX 起動スクリプト${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "${YELLOW}[1/5] Node.js バージョンを確認中...${NC}"
if command -v node >/dev/null 2>&1; then
    NODE_CURRENT=$(node --version)
    echo -e "${GREEN}✓ Node.js バージョン: $NODE_CURRENT${NC}"
else
    echo -e "${RED}✗ Node.js がインストールされていません${NC}"
    exit 1
fi

echo -e "${YELLOW}[2/5] 依存パッケージを確認中...${NC}"
if [ ! -d "$ROOT_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules が存在しません。インストールします...${NC}"
    (cd "$ROOT_DIR" && npm install) || { echo -e "${RED}✗ npm install に失敗しました${NC}"; exit 1; }
else
    echo -e "${GREEN}✓ 依存パッケージは既に存在します${NC}"
fi

echo -e "${YELLOW}[3/5] SSL 証明書を確認中...${NC}"
if [ ! -f "$CERT_DIR/server.key" ] || [ ! -f "$CERT_DIR/server.crt" ]; then
    echo -e "${YELLOW}⚠ SSL 証明書が存在しません。生成します...${NC}"
    if [ -f "$CA_INIT" ]; then
        chmod +x "$CA_INIT"
        "$CA_INIT" || { echo -e "${RED}✗ 証明書生成に失敗しました${NC}"; exit 1; }
    else
        echo -e "${RED}✗ 証明書生成スクリプトが見つかりません: $CA_INIT${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ SSL 証明書は既に存在します${NC}"
fi

echo -e "${YELLOW}[4/5] .env を確認中...${NC}"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠ .env が存在しません。作成します...${NC}"
    cat > "$ENV_FILE" <<EOF
PORT=443
BOOKS_API_KEY=kashidasu_api_key_$(date +%s)
NODE_ENV=production
EOF
    echo -e "${GREEN}✓ .env を作成しました${NC}"
else
    echo -e "${GREEN}✓ .env は既に存在します${NC}"
fi

echo -e "${YELLOW}[5/5] サーバーを起動します...${NC}"
echo -e "${GREEN}✓ 現在のターミナルで npm start を実行します${NC}"
echo -e "${BLUE}========================================${NC}"

cd "$ROOT_DIR"
npm start

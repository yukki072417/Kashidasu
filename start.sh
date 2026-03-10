#!/bin/bash

# Kashidasu 図書館管理システム - screenコマンド起動スクリプト

# 色設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# プロジェクト情報
PROJECT_NAME="Kashidasu"
SCREEN_NAME="kashidasu_server"
NODE_VERSION="22.x"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Kashidasu 図書館管理システム${NC}"
echo -e "${BLUE}  screenコマンド起動スクリプト${NC}"
echo -e "${BLUE}========================================${NC}"

# Node.jsバージョンチェック
echo -e "${YELLOW}[1/5] Node.jsバージョンを確認中...${NC}"
if command -v node &> /dev/null; then
    NODE_CURRENT=$(node --version)
    echo -e "${GREEN}✓ Node.jsバージョン: $NODE_CURRENT${NC}"
    
    # バージョンチェック（簡易的）
    if [[ $NODE_CURRENT == v2* ]]; then
        echo -e "${GREEN}✓ Node.jsバージョンは適切です${NC}"
    else
        echo -e "${YELLOW}⚠ 推奨バージョン: $NODE_VERSION${NC}"
        echo -e "${YELLOW}  現在のバージョン: $NODE_CURRENT${NC}"
    fi
else
    echo -e "${RED}✗ Node.jsがインストールされていません${NC}"
    echo -e "${RED}  Node.js $NODE_VERSION をインストールしてください${NC}"
    exit 1
fi

# 依存パッケージのチェック
echo -e "${YELLOW}[2/5] 依存パッケージを確認中...${NC}"
if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠ node_modulesが存在しません。インストールします...${NC}"
        npm install
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ 依存パッケージをインストールしました${NC}"
        else
            echo -e "${RED}✗ 依存パッケージのインストールに失敗しました${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✓ 依存パッケージは既にインストールされています${NC}"
    fi
else
    echo -e "${RED}✗ package.jsonが見つかりません${NC}"
    exit 1
fi

# 証明書のチェック
echo -e "${YELLOW}[3/5] SSL証明書を確認中...${NC}"
if [ -f "certs/server.key" ] && [ -f "certs/server.crt" ]; then
    echo -e "${GREEN}✓ SSL証明書は既に存在します${NC}"
else
    echo -e "${YELLOW}⚠ SSL証明書が存在しません。生成します...${NC}"
    if [ -f "./ca/init.sh" ]; then
        chmod +x ./ca/init.sh
        ./ca/init.sh
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ SSL証明書を生成しました${NC}"
        else
            echo -e "${RED}✗ SSL証明書の生成に失敗しました${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ 証明書生成スクリプトが見つかりません: ./ca/init.sh${NC}"
        exit 1
    fi
fi

# 環境変数のチェック
echo -e "${YELLOW}[4/5] 環境変数を確認中...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .envファイルが存在します${NC}"
else
    echo -e "${YELLOW}⚠ .envファイルが存在しません。作成します...${NC}"
    cat > .env << EOF
# Kashidasu 環境変数設定
PORT=443
BOOKS_API_KEY=kashidasu_api_key_$(date +%s)
NODE_ENV=production
EOF
    echo -e "${GREEN}✓ .envファイルを作成しました${NC}"
    echo -e "${YELLOW}  必要に応じて.envファイルを編集してください${NC}"
fi

# screenコマンドのチェック
echo -e "${YELLOW}[5/5] screenコマンドを確認中...${NC}"
if command -v screen &> /dev/null; then
    echo -e "${GREEN}✓ screenコマンドは利用可能です${NC}"
else
    echo -e "${RED}✗ screenコマンドがインストールされていません${NC}"
    echo -e "${RED}  Ubuntu/Debian: sudo apt-get install screen${NC}"
    echo -e "${RED}  CentOS/RHEL: sudo yum install screen${NC}"
    echo -e "${RED}  macOS: brew install screen${NC}"
    exit 1
fi

# 既存のscreenセッションのチェック
echo -e "${BLUE}========================================${NC}"
if screen -list | grep -q "$SCREEN_NAME"; then
    echo -e "${YELLOW}⚠ 既存のscreenセッション '$SCREEN_NAME' が存在します${NC}"
    echo -e "${YELLOW}  選択肢:${NC}"
    echo -e "${YELLOW}  1) 既存セッションに接続する${NC}"
    echo -e "${YELLOW}  2) 既存セッションを終了して新規起動${NC}"
    echo -e "${YELLOW}  3) キャンセル${NC}"
    echo -n "選択 (1-3): "
    read choice
    
    case $choice in
        1)
            echo -e "${GREEN}既存セッションに接続します...${NC}"
            screen -r $SCREEN_NAME
            exit 0
            ;;
        2)
            echo -e "${YELLOW}既存セッションを終了します...${NC}"
            screen -S $SCREEN_NAME -X quit
            sleep 2
            ;;
        3)
            echo -e "${YELLOW}キャンセルしました${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}無効な選択です${NC}"
            exit 1
            ;;
    esac
fi

# screenセッションでサーバー起動
echo -e "${GREEN}screenセッションでサーバーを起動します...${NC}"
echo -e "${BLUE}セッション名: $SCREEN_NAME${NC}"
echo -e "${BLUE}プロジェクト: $PROJECT_NAME${NC}"
echo -e "${BLUE}========================================${NC}"

# screenセッションを作成してサーバー起動
screen -dmS $SCREEN_NAME bash -c "
    echo -e '${GREEN}========================================${NC}'
    echo -e '${GREEN}  Kashidasu サーバー起動中...${NC}'
    echo -e '${GREEN}========================================${NC}'
    echo -e '${YELLOW}起動コマンド: npm start${NC}'
    echo -e '${YELLOW}アクセスURL: https://localhost${NC}'
    echo -e '${YELLOW}終了方法: Ctrl+A, D${NC}'
    echo -e '${GREEN}========================================${NC}'
    npm start
"

# 起動確認
sleep 3
if screen -list | grep -q "$SCREEN_NAME"; then
    echo -e "${GREEN}✓ screenセッション '$SCREEN_NAME' が正常に起動しました${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN} 操作方法:${NC}"
    echo -e "${YELLOW}• セッションに接続: screen -r $SCREEN_NAME${NC}"
    echo -e "${YELLOW}• セッションから離脱: Ctrl+A, D${NC}"
    echo -e "${YELLOW}• セッション一覧: screen -list${NC}"
    echo -e "${YELLOW}• セッション終了: screen -S $SCREEN_NAME -X quit${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN} アクセス情報:${NC}"
    echo -e "${YELLOW}• URL: https://10.100.240.171${NC}"
    echo -e "${YELLOW}• 管理者ID: 0123456789${NC}"
    echo -e "${YELLOW}• パスワード: password${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}✓ ログを確認するには: screen -r $SCREEN_NAME${NC}"
else
    echo -e "${RED}✗ screenセッションの起動に失敗しました${NC}"
    echo -e "${RED}  手動で起動してください: npm start${NC}"
    exit 1
fi

echo -e "${GREEN}Kashidasuサーバーのscreen起動が完了しました！${NC}"
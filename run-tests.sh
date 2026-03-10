# テスト実行スクリプト

#!/bin/bash

# 色設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Kashidasu テスト実行スクリプト${NC}"
echo -e "${BLUE}========================================${NC}"

# 引数の処理
TEST_TYPE=${1:-"all"}
COVERAGE=${2:-"false"}

# テスト環境の設定
export NODE_ENV=test
export REPOSITORY_PATH=./src/test-db

# テスト用ディレクトリの作成
mkdir -p src/test-db
mkdir -p test-results
mkdir -p coverage

case $TEST_TYPE in
  "unit")
    echo -e "${YELLOW}単体テストを実行します...${NC}"
    npm run test:unit
    ;;
  "integration")
    echo -e "${YELLOW}統合テストを実行します...${NC}"
    npm run test:integration
    ;;
  "performance")
    echo -e "${YELLOW}パフォーマンステストを実行します...${NC}"
    npm run test:performance
    ;;
  "e2e")
    echo -e "${YELLOW}E2Eテストを実行します...${NC}"
    npm run test:e2e
    ;;
  "all")
    echo -e "${YELLOW}すべてのテストを実行します...${NC}"
    if [ "$COVERAGE" = "true" ]; then
      echo -e "${GREEN}カバレッジを有効にします...${NC}"
      npm run test:coverage
    else
      npm run test:all
    fi
    ;;
  "watch")
    echo -e "${YELLOW}ウォッチモードでテストを実行します...${NC}"
    npm run test:watch
    ;;
  *)
    echo -e "${RED}エラー: 無効なテストタイプ '${TEST_TYPE}'${NC}"
    echo -e "${YELLOW}使用可能なテストタイプ:${NC}"
    echo -e "${YELLOW}  unit        - 単体テスト${NC}"
    echo -e "${YELLOW}  integration - 統合テスト${NC}"
    echo -e "${YELLOW}  performance - パフォーマンステスト${NC}"
    echo -e "${YELLOW}  e2e         - E2Eテスト${NC}"
    echo -e "${YELLOW}  all         - すべてのテスト${NC}"
    echo -e "${YELLOW}  watch       - ウォッチモード${NC}"
    echo -e "${YELLOW}  coverage    - カバレッジ付きテスト${NC}"
    echo ""
    echo -e "${BLUE}使用例:${NC}"
    echo -e "${YELLOW}  ./run-tests.sh unit${NC}"
    echo -e "${YELLOW}  ./run-tests.sh integration${NC}"
    echo -e "${YELLOW}  ./run-tests.sh all true${NC}"
    exit 1
    ;;
esac

# テスト結果の確認
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ テストが正常に完了しました${NC}"
    
    # カバレッジレポートの表示
    if [ "$COVERAGE" = "true" ] || [ "$TEST_TYPE" = "all" ]; then
      echo -e "${BLUE}========================================${NC}"
      echo -e "${BLUE}  カバレッジレポート${NC}"
      echo -e "${BLUE}========================================${NC}"
      echo -e "${YELLOW}HTMLレポート: coverage/lcov-report/index.html${NC}"
      echo -e "${YELLOW}テキストレポート: coverage/lcov-report.txt${NC}"
      echo -e "${YELLOW}LCOVレポート: coverage/lcov.info${NC}"
    fi
else
    echo -e "${RED}✗ テストが失敗しました${NC}"
    exit 1
fi

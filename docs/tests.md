# Kashidasu テストスイート

## 概要

/src/tests/ ディレクトリにKashidasuアプリケーションの包括的なテストスイートが含まれています。

## テスト構成

```
src/tests/
├── unit/                    # 単体テスト
│   ├── model/               # モデル層テスト
│   │   ├── adminModel.test.js     # Adminモデルのテスト
│   │   ├── bookModel.test.js     # Bookモデルのテスト
│   │   ├── loanModel.test.js     # Loanモデルのテスト
│   │   └── userModel.test.js     # Userモデルのテスト
│   ├── router/              # ルーター層テスト
│   │   ├── adminRoutes.test.js    # 管理者ルーターのテスト
│   │   ├── bookRoutes.test.js     # 書籍ルーターのテスト
│   │   ├── userRoutes.test.js     # ユーザールーターのテスト
│   │   └── apiRoutes.test.js      # APIルーターのテスト
│   ├── controller/          # コントローラー層テスト
│   │   ├── adminController.test.js # 管理者コントローラーのテスト
│   │   ├── bookController.test.js  # 書籍コントローラーのテスト
│   │   ├── cardController.test.js  # カードコントローラーのテスト
│   │   └── userController.test.js  # ユーザーコントローラーのテスト
│   └── service/             # サービス層テスト
│       ├── authService.test.js    # 認証サービスのテスト
│       ├── cardService.test.js    # カードサービスのテスト
│       ├── cryptoService.test.js  # 暗号サービスのテスト
│       └── errorHandling.test.js  # エラーハンドリングのテスト
├── integration/             # 統合テスト
│   ├── books.test.js        # 書籍API統合テスト
│   ├── admin.test.js        # 管理者API統合テスト
│   ├── users.test.js        # ユーザーAPI統合テスト
│   ├── cards.test.js        # カードAPI統合テスト
│   ├── testApp.js           # 統合テスト用Expressアプリ
│   └── setup.js             # 統合テストセットアップ
├── setup.js               # 全体テストセットアップ
```

## 実行方法

### すべてのテストを実行

```bash
npm test
# または
npm run test:all
# または
./run-tests.sh all
```

### 単体テストのみ実行

```bash
npm run test:unit
# または
./run-tests.sh unit

# モデル層のみ
npm test src/tests/unit/model/

# ルーター層のみ
npm test src/tests/unit/router/
```

### 統合テストのみ実行

```bash
npm run test:integration
# または
./run-tests.sh integration

# 特定の統合テストのみ
npm test src/tests/integration/books.test.js
npm test src/tests/integration/admin.test.js
npm test src/tests/integration/users.test.js
npm test src/tests/integration/cards.test.js
```

### パフォーマンステストのみ実行

```bash
npm run test:performance
# または
./run-tests.sh performance
```

### E2Eテストのみ実行

```bash
npm run test:e2e
# または
./run-tests.sh e2e
```

### カバレッジレポート付きで実行

```bash
npm run test:coverage
# または
./run-tests.sh all true
```

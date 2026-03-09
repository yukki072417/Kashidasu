# バックエンド統合テスト

## 概要

このディレクトリにはKashidasuアプリケーションのバックエンド統合テストが含まれています。

## テスト構成

```
src/tests/
├── unit/              # 単体テスト
│   └── model.test.js  # モデル層のテスト
├── integration/       # 統合テスト
│   └── api.test.js   # APIエンドポイントのテスト
├── setup.js          # テストセットアップ
└── README.md         # このファイル
```

## テストカバレッジ

### 単体テスト (`unit/model.test.js`)
- ✅ AdminモデルのCRUD操作
- ✅ UserモデルのCRUD操作  
- ✅ BookモデルのCRUD操作
- ✅ エラーハンドリング
- ✅ バリデーション

### 統合テスト (`integration/api.test.js`)
- ✅ Admin APIエンドポイント
  - POST /api/admin/register
  - POST /api/admin/login
  - GET /api/admin/get
- ✅ User APIエンドポイント
  - POST /api/user/register
  - GET /api/user/get
  - PUT /api/user/update
- ✅ Book APIエンドポイント
  - POST /api/book/register
  - GET /api/book/get
  - PUT /api/book/update
  - GET /api/book/search
- ✅ Loan APIエンドポイント
  - POST /api/book/lend
  - POST /api/book/return
- ✅ エラーハンドリング
- ✅ データバリデーション

## 実行方法

### すべてのテストを実行
```bash
npm test
# または
npm run test:all
```

### 単体テストのみ実行
```bash
npm run test:unit
```

### 統合テストのみ実行
```bash
npm run test:integration
```

### カバレッジレポート付きで実行
```bash
npm test -- --coverage
```

## テスト環境

### テスト用データベース
- テスト実行時に一時的なデータベースが作成されます
- `src/test-db/` ディレクトリにJSONファイルが保存されます
- テスト完了後に自動的にクリーンアップされます

### 環境変数
- `NODE_ENV=test`: テスト環境を識別
- `REPOSITORY_PATH=./src/test-db`: テスト用DBパス

## テストデータ

### テスト管理者
```json
{
  "adminId": "testadmin123",
  "password": "testpass123"
}
```

### テストユーザー
```json
{
  "userId": "testuser123",
  "password": "userpass123"
}
```

### テスト書籍
```json
{
  "isbn": "9784167158057",
  "title": "テスト書籍",
  "author": "テスト著者",
  "publisher": "テスト出版社"
}
```

## 主要なテストシナリオ

### 1. 管理者機能
- ✅ 新規管理者登録
- ✅ ログイン認証
- ✅ 不正パスワードでのログイン失敗
- ✅ 管理者情報取得

### 2. ユーザー管理
- ✅ 新規ユーザー登録
- ✅ ユーザー情報取得
- ✅ ユーザー情報更新

### 3. 書籍管理
- ✅ 新規書籍登録
- ✅ 書籍情報取得
- ✅ 書籍情報更新
- ✅ 書籍検索

### 4. 貸出・返却機能
- ✅ 正常な貸出処理
- ✅ すでに貸出中の書籍の貸出拒否
- ✅ 正常な返却処理
- ✅ 貸出されていない書籍の返却拒否

### 5. エラーハンドリング
- ✅ 存在しないエンドポイントへのアクセス
- ✅ 無効なJSONデータの処理
- ✅ 必須パラメータの欠落

### 6. データバリデーション
- ✅ ISBN形式の検証
- ✅ ユーザーID形式の検証

## CI/CD連携

このテストスイートは以下のCI/CDパイプラインで使用できます：

```yaml
# GitHub Actionsの例
- name: Run Backend Tests
  run: |
    npm install
    npm run test:all
```

## レポート

### カバレッジレポート
- テスト実行後、`coverage/` ディレクトリに生成されます
- `coverage/lcov-report/index.html` をブラウザで開いて詳細を確認

### JUnit XML
- CIツール連携用のXMLレポートも生成可能です

## トラブルシューティング

### よくある問題

1. **ポート競合エラー**
   - テストはランダムポートを使用します
   - 既存のサーバーを停止してから実行してください

2. **データベースアクセスエラー**
   - `src/test-db/` ディレクトリの権限を確認
   - ディスク容量を確認

3. **タイムアウトエラー**
   - `jest.setTimeout()` の値を調整
   - ネットワーク接続を確認

### デバッグ方法

```bash
# 詳細なログで実行
npm run test:integration -- --verbose

# 特定のテストのみ実行
npm run test:integration -- --testNamePattern="Admin API"

# デバッグモードで実行
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 拡張

### 新しいテストの追加
1. 対応するテストファイルを作成
2. `describe` ブロックでテストグループを定義
3. `test` 関数で個別のテストケースを記述
4. `expect` でアサーションを記述

### モックの使用
```javascript
jest.mock('../../model/adminModel', () => ({
  createAdmin: jest.fn(),
  getAdmin: jest.fn(),
  // ...
}));
```

## 貢献

テストの改善や追加の提案は歓迎します。以下の点に注意してください：

1. テストは独立して実行可能であること
2. クリーンアップ処理を含めること
3. エッジケースを考慮すること
4. 適切なアサーションを使用すること

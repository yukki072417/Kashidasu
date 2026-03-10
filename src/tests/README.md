# Kashidasu テストスイート

## 概要

このディレクトリにはKashidasuアプリケーションの包括的なテストスイートが含まれています。

## テスト構成

```
src/tests/
├── unit/                    # 単体テスト
│   ├── adminModel.test.js     # Adminモデルのテスト
│   ├── bookModel.test.js     # Bookモデルのテスト
│   ├── loanModel.test.js     # Loanモデルのテスト
│   ├── authService.test.js    # Authサービスのテスト
│   ├── errorHandling.test.js  # エラーハンドリングのテスト
│   └── frontend.test.js      # フロントエンドのテスト
├── integration/             # 統合テスト
│   ├── adminController.test.js # Adminコントローラーのテスト
│   ├── bookController.test.js  # Bookコントローラーのテスト
│   ├── performance.test.js   # パフォーマンステスト
│   └── e2e.test.js           # E2Eテスト
├── setup.js               # テストセットアップ
└── README.md              # このファイル
```

## テストカバレッジ

### 単体テスト

- ✅ **Adminモデル** (`adminModel.test.js`)
  - 管理者登録・取得・更新
  - パスワードハッシュ化・検証
  - バリデーション機能
  - エラーハンドリング

- ✅ **Bookモデル** (`bookModel.test.js`)
  - 書籍登録・取得・更新・削除
  - 書籍検索機能
  - ISBNバリデーション
  - データ整合性チェック

- ✅ **Loanモデル** (`loanModel.test.js`)
  - 貸出記録の作成・取得
  - 返却処理
  - 期限切れチェック
  - 貸出履歴管理
  - 期限日計算

- ✅ **Authサービス** (`authService.test.js`)
  - 認証ミドルウェア
  - ログイン・ログアウト機能
  - セッション管理
  - 権限チェック

- ✅ **エラーハンドリング** (`errorHandling.test.js`)
  - HTTPステータスコード処理
  - バリデーションエラー
  - 環境別エラー表示
  - ログ記録機能

- ✅ **フロントエンド** (`frontend.test.js`)
  - DOM操作
  - イベントハンドリング
  - API通信
  - バーコード読み取り
  - レスポンシブデザイン

### 統合テスト

- ✅ **Adminコントローラー** (`adminController.test.js`)
  - 管理者登録API
  - ログイン認証API
  - 管理者情報取得API
  - 管理者更新API
  - エラーレスポンス

- ✅ **Bookコントローラー** (`bookController.test.js`)
  - 書籍登録API
  - 書籍取得API
  - 書籍更新API
  - 書籍削除API
  - 書籍検索API
  - 貸出・返却API

- ✅ **パフォーマンステスト** (`performance.test.js`)
  - レスポンスタイム測定
  - メモリ使用量監視
  - CPU使用時間測定
  - データベースパフォーマンス
  - 並列処理テスト
  - 負荷テスト

- ✅ **E2Eテスト** (`e2e.test.js`)
  - ユーザー認証フロー
  - 書籍管理操作
  - バーコード読み取り
  - カード生成機能
  - レスポンシブデザイン
  - エラーハンドリング
  - アクセシビリティ

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
```

### 統合テストのみ実行

```bash
npm run test:integration
# または
./run-tests.sh integration
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

### ウォッチモードで実行

```bash
npm run test:watch
# または
./run-tests.sh watch
```

## テスト環境

### 環境変数

- `NODE_ENV=test`: テスト環境を識別
- `REPOSITORY_PATH=./src/test-db`: テスト用DBパス

### テスト用データベース

- テスト実行時に一時的なデータベースが作成されます
- `src/test-db/` ディレクトリにJSONファイルが保存されます
- テスト完了後に自動的にクリーンアップされます

## カバレッジレポート

### レポート形式

- **HTML**: `coverage/lcov-report/index.html` - ブラウザで閲覧可能
- **LCOV**: `coverage/lcov.info` - CIツール連携用
- **テキスト**: `coverage/lcov-report.txt` - コンソール出力用
- **JUnit**: `test-results/junit.xml` - CI/CDパイプライン用

### カバレッジしきい値

- **グローバル**: 80% (分岐、関数、行、ステートメント)
- **src/ディレクトリ**: 85% (より高い基準)

## CI/CD連携

### GitHub Actions

```yaml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 主要なテストシナリオ

### 1. 認証機能

- ✅ 管理者登録・ログイン
- ✅ 無効な認証情報の拒否
- ✅ セッション管理
- ✅ 権限チェック

### 2. 書籍管理

- ✅ CRUD操作（登録・取得・更新・削除）
- ✅ 書籍検索（部分一致・ISBN検索）
- ✅ バリデーション（ISBN形式・必須項目）
- ✅ 貸出状態チェック

### 3. 貸出・返却機能

- ✅ 貸出処理（重複チェック・期限計算）
- ✅ 返却処理（状態更新）
- ✅ 期限切れ検出
- ✅ 貸出履歴管理

### 4. エラーハンドリング

- ✅ HTTPステータスコード（400, 401, 403, 404, 500）
- ✅ バリデーションエラー
- ✅ 環境別エラー表示
- ✅ ログ記録

### 5. パフォーマンス

- ✅ レスポンスタイム（500ms以内）
- ✅ メモリ使用量（100MB以内）
- ✅ CPU使用時間（1秒以内）
- ✅ 並列処理
- ✅ 負荷テスト（100同時接続）

### 6. E2E

- ✅ ユーザーフロー（ログイン→操作→ログアウト）
- ✅ 書籍管理フロー
- ✅ バーコード読み取りフロー
- ✅ カード生成フロー
- ✅ レスポンシブデザイン
- ✅ アクセシビリティ

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

4. **E2Eテストの失敗**
   - Playwrightの依存関係を確認
   - ブラウザのバージョンを確認
   - HTTPS証明書の問題を確認

### デバッグ方法

```bash
# 詳細なログで実行
npm run test:all -- --verbose

# 特定のテストのみ実行
npm run test:unit -- --testNamePattern="Admin"

# デバッグモードで実行
node --inspect-brk node_modules/.bin/jest --runInBand

# カバレッジ詳細表示
npm run test:coverage -- --coverageReporters=text-lcov
```

## 拡張

### 新しいテストの追加

1. 対応するテストファイルを作成
2. `describe` ブロックでテストグループを定義
3. `test` 関数で個別のテストケースを記述
4. `expect` でアサーションを記述

### モックの使用

```javascript
jest.mock("../../model/adminModel", () => ({
  createAdmin: jest.fn(),
  getAdmin: jest.fn(),
  // ...
}));
```

### カスタムマッチャー

```javascript
// カスタムマッチャーの定義
expect.extend({
  toBeValidBook(received) {
    const pass =
      received &&
      typeof received.isbn === "string" &&
      typeof received.title === "string" &&
      typeof received.author === "string";

    if (pass) {
      return {
        message: () => `expected ${received} to be a valid book`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid book`,
        pass: false,
      };
    }
  },
});

// 使用例
expect(bookData).toBeValidBook();
```

## 貢献

テストの改善や追加の提案は歓迎します。以下の点に注意してください：

1. **独立性**: 各テストは独立して実行可能であること
2. **クリーンアップ**: テスト後に適切なクリーンアップ処理を含めること
3. **エッジケース**: 境界条件や異常系を考慮すること
4. **アサーション**: 適切で明確なアサーションを使用すること
5. **カバレッジ**: 新規コードは適切なテストカバレッジを目指すこと

## ライセンス

このテストスイートはMITライセンスの下で提供されています。

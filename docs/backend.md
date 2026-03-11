# バックエンド仕様書

## 1. データベース（コレクション）仕様

### 1.1 概要

KashidasuシステムはJSONファイルベースのデータストアを使用しており、以下の4つの主要なデータコレクションで構成されています。

### 1.2 データコレクション一覧

#### 1.2.1 usersコレクション

**ファイルパス**: `repository/user.json`

**スキーマ**:

```json
{
  "userId": "string", // ユーザーID（主キー）
  "password": "string" // ハッシュ化されたパスワード
}
```

**説明**: 一般ユーザーの認証情報を管理するコレクション

#### 1.2.2 adminsコレクション

**ファイルパス**: `repository/admin.json`

**スキーマ**:

```json
{
  "adminId": "string", // 管理者ID（主キー）
  "password": "string" // ハッシュ化されたパスワード
}
```

**説明**: 管理者の認証情報を管理するコレクション

#### 1.2.3 booksコレクション

**ファイルパス**: `repository/book.json`

**スキーマ**:

```json
{
  "isbn": "string", // ISBNコード（主キー）
  "title": "string", // 書籍タイトル
  "author": "string" // 著者名
}
```

**説明**: 図書館の書籍情報を管理するコレクション

#### 1.2.4 loansコレクション

**ファイルパス**: `repository/loan.json`

**スキーマ**:

```json
{
  "loanId": "string", // 貸出ID（主キー）
  "bookId": "string", // 書籍ISBN（外部キー）
  "userId": "string", // ユーザーID（外部キー）
  "loanDate": "string", // 貸出日 (YYYY-MM-DD形式)
  "returnDate": "string", // 返却日 (YYYY-MM-DD形式, nullの場合は貸出中)
  "dueDate": "string" // 貸出期限日 (YYYY-MM-DD形式)
}
```

**説明**: 書籍の貸出履歴を管理するコレクション

#### 1.2.5 adminsコレクション

**ファイルパス**: `repository/admin.json`

**スキーマ**:

```json
{
  "adminId": "string", // 管理者ID（主キー）
  "password": "string" // ハッシュ化されたパスワード
}
```

**説明**: 管理者情報を管理するコレクション

### 1.3 データフロー

- 各コレクションはJSONファイルとして永続化
- CRUD操作は非同期で実行
- データ整合性はモデル層で保証

## 2. APIエンドポイント仕様

### 2.1 共通レスポンス形式

すべてのAPIエンドポイントは以下の統一されたレスポンス形式を返します：

```json
{
  "success": boolean, // 処理の成功・失敗
  "message": string,  // 結果メッセージ
  "data": any        // レスポンスデータ（成功時のみ）
}
```

### 2.2 書籍管理API (`/api/book`)

#### 2.2.1 書籍情報取得

- **エンドポイント**: `GET /api/book/one`
- **クエリパラメータ**:
  - `isbn` (string): ISBNコード
  - `manual_search_mode` (boolean): 手動検索モード
- **レスポンス**:

```json
{
  "success": true,
  "message": "書籍が正常に取得されました",
  "data": {
    "isbn": "9784873117720",
    "title": "情報アーキテクチャ",
    "author": "Louis Rosenfeld"
  }
}
```

#### 2.2.2 全書籍一覧取得

- **エンドポイント**: `GET /api/book/all`
- **クエリパラメータ**:
  - `page` (number): ページ番号（デフォルト: 1）
  - `limit` (number): 1ページあたりの件数（デフォルト: 30）
- **レスポンス**:

```json
{
  "success": true,
  "message": "書籍一覧が正常に取得されました",
  "data": [
    { "COUNT(isbn)": 100 },
    {
      "isbn": "9784873117720",
      "title": "情報アーキテクチャ",
      "author": "Louis Rosenfeld"
    }
    // ...
  ]
}
```

#### 2.2.3 書籍作成

- **エンドポイント**: `POST /api/book`
- **リクエストボディ**:

```json
{
  "isbn": "9784873117720",
  "title": "情報アーキテクチャ",
  "author": "Louis Rosenfeld"
}
```

#### 2.2.4 書籍更新

- **エンドポイント**: `PUT /api/book`
- **リクエストボディ**:

```json
{
  "before_isbn": "9784873117720",
  "isbn": "9784873117721",
  "title": "新しいタイトル",
  "author": "新しい著者"
}
```

#### 2.2.5 書籍削除

- **エンドポイント**: `DELETE /api/book`
- **リクエストボディ**:

```json
{
  "isbn": "9784873117720"
}
```

#### 2.2.6 書籍検索

- **エンドポイント**: `POST /api/book/search`
- **リクエストボディ**:

```json
{
  "query": "検索キーワード",
  "searchType": "title|author|isbn"
}
```

### 2.3 貸出管理API (`/api/book/loan`)

#### 2.3.1 貸出情報取得

- **エンドポイント**: `GET /api/book/loan`
- **クエリパラメータ**: `isbn` (string): ISBNコード
- **レスポンス**:

```json
{
  "success": true,
  "message": "貸出情報が正常に取得されました",
  "data": {
    "loanId": "1773039782286",
    "bookId": "9784873117720",
    "userId": "3236541033",
    "loanDate": "2026-03-09",
    "returnDate": null,
    "dueDate": "2026-03-16",
    "daysBorrowed": 0
  }
}
```

#### 2.3.2 全貸出情報取得

- **エンドポイント**: `GET /api/book/loan/all`
- **レスポンス**:

```json
{
  "success": true,
  "message": "貸出一覧が正常に取得されました",
  "data": [
    {
      "loanId": "1773039782286",
      "bookId": "9784873117720",
      "userId": "3236541033",
      "loanDate": "2026-03-09",
      "returnDate": null,
      "dueDate": "2026-03-16",
      "daysBorrowed": 0,
      "bookInfo": {
        "title": "情報アーキテクチャ",
        "author": "Louis Rosenfeld",
        "isbn": "9784873117720"
      }
    }
  ],
  "count": 1,
  "totalActive": 1
}
```

#### 2.3.3 書籍貸出

- **エンドポイント**: `POST /api/book/lend`
- **リクエストボディ**:

```json
{
  "user_id": "3236541033",
  "isbn": "9784873117720"
}
```

- **レスポンス**:

```json
{
  "success": true,
  "message": "本が正常に貸出されました",
  "data": {
    "loanId": "1773039782286",
    "dueDate": "2026-03-16"
  }
}
```

#### 2.3.4 書籍返却

- **エンドポイント**: `POST /api/book/return`
- **リクエストボディ**:

```json
{
  "user_id": "3236541033",
  "isbn": "9784873117720"
}
```

### 2.4 管理者API (`/api/admin`)

#### 2.4.1 管理者ログイン

- **エンドポイント**: `POST /api/admin/login`
- **リクエストボディ**:

```json
{
  "adminId": "admin",
  "password": "password"
}
```

#### 2.4.2 管理者ログアウト

- **エンドポイント**: `GET /api/admin/logout`

### 2.5 公開API (`/public`)

#### 2.5.1 公開書籍情報

- **エンドポイント**: `GET /public/books`
- **認証**: APIキー認証（`X-API-Key` ヘッダーまたは `api_key` クエリパラメータ）

#### 2.5.2 公開貸出情報

- **エンドポイント**: `GET /public/loans`
- **認証**: APIキー認証

### 2.6 認証仕様

#### 2.6.1 APIキー認証（公開API）

- **ヘッダー**: `X-API-Key: <API_KEY>`
- **クエリパラメータ**: `?api_key=<API_KEY>`
- **環境変数**: `BOOKS_API_KEY`

#### 2.6.2 セッション認証（管理API）

- **セッションキー**: `req.session.admin`
- **有効期限**: 24時間

#### 2.6.3 貸出期限ルール

- **管理者ユーザー**: 貸出日から14日後
- **一般ユーザー**: 貸出日から7日後

## 3. アーキテクチャ

### 3.1 レイヤー構成

```bash
src/
├── app.js              # Expressアプリケーション
├── router/             # ルーティング層
│   ├── bookRoutes.js   # 書籍関連ルート
│   ├── userRoutes.js   # ユーザー関連ルート
│   ├── apiRoutes.js    # API関連ルート
│   ├── adminRoutes.js  # 管理者関連ルート
│   └── publicRoutes.js # 公開APIルート
├── controller/         # コントローラー層
│   ├── bookController.js
│   ├── userController.js
│   └── adminController.js
├── model/              # モデル層
│   ├── bookModel.js
│   ├── userModel.js
│   ├── loanModel.js
│   └── adminModel.js
├── db/models/          # データベースモデル
│   ├── book.js
│   ├── user.js
│   ├── loan.js
│   └── admin.js
├── services/           # サービス層
│   ├── auth.js         # 認証サービス
│   └── crypto.js       # 暗号化サービス
└── views/              # EJSテンプレート
```

### 3.2 認証ミドルウェア

#### 3.2.1 APIキー認証 (`apiKeyAuth`)

- 公開APIで使用
- `X-API-Key` ヘッダーまたは `api_key` クエリパラメータを検証

#### 3.2.2 セッション認証 (`apiAuth`)

- 管理APIで使用
- `req.session.admin` の存在を検証

### 3.3 エラーハンドリング

- 統一されたエラーレスポンス形式
- HTTPステータスコードの適切な使用
- 詳細なエラーログ記録

### 3.4 セキュリティ

- パスワードのハッシュ化（bcrypt）
- セッションベースの認証
- APIキーによる公開API制御
- HTTPS対応

## 4. 環境設定

### 4.1 必要な環境変数

```bash
BOOKS_API_KEY="<Google Books APIキー(任意)>"
PORT=443
```

### 4.2 依存パッケージ

```json
{
  "@pdf-lib/fontkit": "^1.1.1",
  "bcrypt": "^6.0.0",
  "bwip-js": "^4.7.0",
  "dotenv": "^16.4.7",
  "ejs": "^3.1.10",
  "express": "^4.21.1",
  "express-session": "^1.18.0",
  "log4js": "^6.9.1",
  "pdf-lib": "^1.17.1"
}
```

### 4.3 起動方法

```bash
npm install
npm start
```

サーバーはHTTPSでポート443で起動します。

### 3.6 貸出・返却機能詳細

#### 3.6.1 バーコードリーダー対応

- **フロントエンド**: Quagga.jsを使用
- **ユーザー認証**: 10桁のユーザーバーコードを読み取り
- **書籍認証**: 13桁のISBNバーコードを読み取り
- **手入力対応**: キーボードからの直接入力も可能

#### 3.6.2 貸出フロー

1. ユーザーバーコード（10桁）を読み取り
2. ISBNバーコード（13桁）を読み取り
3. `POST /api/book/lend` を実行
4. 書籍の貸出状況を更新
5. 貸出記録を作成

#### 3.6.3 返却フロー

1. ユーザーバーコード（10桁）を読み取り
2. ISBNバーコード（13桁）を読み取り
3. `POST /api/book/return` を実行
4. 書籍の貸出状況を更新
5. 貸出記録に返却日を設定

#### 3.6.4 APIレスポンス形式

貸出・返却APIは以下のメッセージ形式で応答：

- `SUCCESS`: 正常完了
- `BOOK_NOT_EXIST`: 書籍が存在しない
- `BOOK_ALRADY_LENDING`: 書籍は既に貸出中
- `BOOK_NOT_LENDING`: 書籍は貸出されていない

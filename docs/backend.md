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
  "author": "string", // 著者名
  "isBorrowed": "boolean" // 貸出状況（true: 貸出中, false: 利用可能）
}
```

**説明**: 図書館の書籍情報を管理するコレクション

#### 1.2.4 loansコレクション

**ファイルパス**: `repository/loans.json`

**スキーマ**:

```json
{
  "loanId": "string", // 貸出ID（主キー）
  "bookId": "string", // 書籍ISBN（外部キー）
  "userId": "string", // ユーザーID（外部キー）
  "loanDate": "string", // 貸出日
  "returnDate": "string" // 返却日（nullの場合は貸出中）
}
```

**説明**: 書籍の貸出履歴を管理するコレクション

### 1.3 データフロー

- 各コレクションはJSONファイルとして永続化
- CRUD操作は非同期で実行
- データ整合性はモデル層で保証

## 2. APIエンドポイント仕様

### 2.1 ユーザー管理API (`/api/user`)

#### 2.1.1 ユーザー登録

- **エンドポイント**: `POST /api/user/register`
- **リクエストボディ**:

```json
{
  "userId": "string",
  "password": "string"
}
```

- **レスポンス**:
  - 成功: `{"result": "SUCCESS"}`
  - 失敗: `{"result": "FAILED", "message": "エラーメッセージ"}`

#### 2.1.2 ユーザー情報取得

- **エンドポイント**: `GET /api/user/get`
- **リクエストボディ**:

```json
{
  "userId": "string"
}
```

- **レスポンス**: ユーザーオブジェクトまたはエラー

#### 2.1.3 ユーザー情報更新

- **エンドポイント**: `PUT /api/user/update`
- **リクエストボディ**:

```json
{
  "user_id": "string",
  "user_password": "string"
}
```

#### 2.1.4 ユーザー削除

- **エンドポイント**: `DELETE /api/user/delete`
- **リクエストボディ**:

```json
{
  "user_id": "string"
}
```

### 2.2 管理者管理API (`/api/admin`)

#### 2.2.1 管理者登録

- **エンドポイント**: `POST /api/admin/signin`
- **リクエストボディ**:

```json
{
  "adminId": "string",
  "password": "string"
}
```

#### 2.2.2 管理者ログイン

- **エンドポイント**: `POST /api/admin/login`
- **リクエストボディ**:

```json
{
  "adminId": "string",
  "password": "string"
}
```

#### 2.2.3 管理者ログアウト

- **エンドポイント**: `POST /api/admin/logout`
- **説明**: セッションを破棄

### 2.3 書籍管理API (`/api/book`)

#### 2.3.1 書籍登録

- **エンドポイント**: `POST /api/book/register`
- **リクエストボディ**:

```json
{
  "isbn": "string",
  "title": "string",
  "author": "string"
}
```

#### 2.3.2 書籍情報取得

- **エンドポイント**: `GET /api/book/get`
- **リクエストボディ**:

```json
{
  "isbn": "string",
  "manual_search_mode": "boolean"
}
```

- **レスポンス**:
  - 手動検索モード: 単一書籍情報
  - 一覧モード: `[{"COUNT(isbn)": 数量}, ...書籍リスト]`

#### 2.3.3 書籍情報更新

- **エンドポイント**: `PUT /api/book/update`
- **リクエストボディ**:

```json
{
  "before_isbn": "string",
  "isbn": "string",
  "title": "string",
  "author": "string"
}
```

#### 2.3.4 書籍削除

- **エンドポイント**: `DELETE /api/book/delete`
- **リクエストボディ**:

```json
{
  "isbn": "string",
  "all_delete": "boolean"
}
```

#### 2.3.5 一括登録

- **エンドポイント**: `POST /api/book/register`
- **リクエストボディ**:

```json
{
  "books": [
    {
      "isbn": "string",
      "title": "string",
      "author": "string"
    }
  ]
}
```

### 2.4 カード生成API (`/api`)

#### 2.4.1 カード生成

- **エンドポイント**: `POST /api/generating`
- **リクエストボディ**:

```json
{
  "id": "string",
  "gread": "string",
  "class": "string",
  "number": "string"
}
```

- **レスポンス**:

```json
{
  "result": "SUCCESS",
  "htmlPath": "/pdf/kashidasu_card.html",
  "pdfPath": "/pdf/kashidasu_card.pdf"
}
```

#### 2.4.2 カード状況確認

- **エンドポイント**: `GET /api/card/status`
- **レスポンス**:

```json
{
  "result": "SUCCESS",
  "pdfExists": "boolean",
  "pngExists": "boolean",
  "pdfPath": "/pdf/kashidasu_card.pdf",
  "pngPath": "/pdf/kashidasu_card.png"
}
```

## 3. その他仕様

### 3.1 技術仕様

- **バックエンド**: Node.js + Express.js
- **データストア**: JSONファイルベース
- **認証**: Expressセッション
- **暗号化**: カスタムcryptoサービス

### 3.2 セキュリティ

- パスワードはハッシュ化して保存
- セッションベースの認証
- 管理者権限によるアクセス制御

### 3.3 エラーハンドリング

- 統一されたエラーレスポンス形式
- ログ出力による監視
- クライアントへの適切なエラー通知

### 3.4 制約事項

#### 3.4.1 データストア制約

データストアは/repositoryにJSONファイルベースで記録される。フォーマットは以下の通りである

##### user.json

```json
{
  "id": "string",
  "gread": "string",
  "class": "string",
  "number": "string"
}
```

##### book.json

```json
{
  "isbn": "string",
  "title": "string",
  "author": "string"
}
```

##### loans.json

```json
{
  "userId": "string",
  "bookId": "string",
  "borrowedAt": "string",
  "returnedAt": "string"
}
```

##### admin.json

```json
{
  "adminId": "string",
  "password": "string"
}
```

### 3.5 機能制約

- 貸出貸出機能は実装貸出貸出機能は実装済み（ReadCode.js経由でバーコード読み取り対応）
- 検索機能は実装済み
- ページング機能は簡易実装

### 3.6 貸出・返却機能詳細

#### 3.6.1 バーコードリーダー対応

- **フロントエンド**: ReadCode.js + Quagga.jsを使用
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

# フロントエンド仕様書

## 1. 概要

Kashidasu図書館管理システムのフロントエンド仕様書。Webベースの図書館管理システムで、書籍の貸出・返却、管理、検索などの機能を提供します。

## 2. 技術スタック

### 2.1 基本技術

- **HTML5**: セマンティックマークアップ
- **CSS3**: モダンなスタイリングとアニメーション
- **JavaScript (ES6+)**: モダンなJavaScript機能
- **jQuery**: DOM操作とイベント処理
- **EJS**: サーバーサイドレンダリングテンプレート

### 2.2 UIライブラリ

- **Bootstrap**: レスポンシブデザインとコンポーネント
- **QuaggaJS**: バーコードスキャン機能
- **Chart.js**: データ可視化（将来的な拡張用）

## 3. ページ構成

### 3.1 ページ一覧

| ページ名       | ファイルパス                              | 説明                 |
| -------------- | ----------------------------------------- | -------------------- |
| ログイン       | `/views/login.ejs`                        | 管理者ログイン画面   |
| メイン         | `/views/main.ejs`                         | メインメニュー画面   |
| 書籍一覧       | `/views/bookList.ejs`                     | 書籍一覧・検索画面   |
| 書籍編集       | `/views/editBook.ejs`                     | 書籍情報編集画面     |
| カード生成     | `/views/generateCard.ejs`                 | 利用者カード生成画面 |
| バーコード読取 | `/views/readCode.ejs`                     | バーコード読取画面   |
| 個別登録       | `/views/Registers/scanningRegister.ejs`   | 個別書籍登録画面     |
| 一括登録       | `/views/Registers/collectiveRegister.ejs` | 一括書籍登録画面     |

## 4. 共通コンポーネント

### 4.1 ヘッダー (`/views/Header.ejs`)

```html
<header>
  <nav>
    <!-- ナビゲーションメニュー -->
  </nav>
</header>
```

### 4.2 フッター (`/views/Footer.ejs`)

```html
<footer>
  <!-- フッター情報 -->
</footer>
```

## 5. JavaScriptファイル構成

### 5.1 主要JavaScriptファイル

| ファイル名              | 機能           | 説明                                    |
| ----------------------- | -------------- | --------------------------------------- |
| `bookList.js`           | 書籍一覧表示   | 書籍一覧の表示、検索、ページング        |
| `editBook.js`           | 書籍編集       | 書籍情報の編集、削除機能                |
| `generateCard.js`       | カード生成     | 利用者カードの生成機能                  |
| `readCode.js`           | バーコード読取 | バーコードスキャンと貸出処理            |
| `scanningRegister.js`   | 個別登録       | バーコードスキャンによる書籍登録        |
| `collectiveRegister.js` | 一括登録       | CSVファイル・テキスト入力による一括登録 |

### 5.2 共通JavaScriptファイル

| ファイル名            | 機能             | 説明              |
| --------------------- | ---------------- | ----------------- |
| `jquery-3.7.1.min.js` | jQueryライブラリ | DOM操作ライブラリ |
| `main.js`             | メイン処理       | 共通の初期化処理  |

## 6. API通信仕様

### 6.1 通信方式

- **Fetch API**: モダンな非同期通信
- **JSON形式**: リクエスト・レスポンスデータ形式
- **HTTPS**: セキュアな通信

### 6.2 エラーハンドリング

```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "APIエラー");
  }

  // 成功処理
} catch (error) {
  console.error("APIエラー:", error);
  alert("エラーが発生しました: " + error.message);
}
```

### 6.3 共通レスポンス形式

```json
{
  "success": boolean,
  "message": string,
  "data": any
}
```

## 7. UI/UX仕様

### 7.1 デザイン原則

- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **アクセシビリティ**: WCAG 2.1準拠
- **ユーザーフレンドリー**: 直感的な操作と分かりやすい表示

### 7.2 カラースキーム

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
}
```

### 7.3 フォント

- **基本フォント**: "Noto Sans JP", "Helvetica Neue", Arial, sans-serif
- **コードフォント**: "Courier New", monospace

## 8. 機能詳細

### 8.1 書籍一覧機能 (`bookList.js`)

#### 8.1.1 表示形式

```html
<table id="table">
  <thead>
    <tr>
      <th>書籍名</th>
      <th>著者</th>
      <th>ISBN</th>
      <th>状態</th>
      <th>借りている人</th>
      <th>メニュー</th>
      <th>貸出日 -> 返却日</th>
      <th>返却日</th>
    </tr>
  </thead>
  <tbody>
    <!-- 書籍データ行 -->
  </tbody>
</table>
```

#### 8.1.2 状態表示

- **空き**: 利用可能
- **貸出中**: 現在貸出中
- **返却済み**: 返却処理完了

#### 8.1.3 期限表示形式

```
(貸出日) -> (返却期限日)
例: (26/03/09) -> (26/03/16)
```

#### 8.1.4 期限切れフィルター

- ボタンで期限切れ書籍のみ表示
- 期限切れの判定: `returnDate`がnullで`dueDate`が過去日付

### 8.2 書籍編集機能 (`editBook.js`)

#### 8.2.1 編集制限

- 貸出中の書籍は編集不可
- 貸出状態は `/api/book/loan` で確認
- テキストボックスが無効化され警告メッセージ表示

#### 8.2.2 API通信

```javascript
// 書籍情報取得
const response = await fetch(
  `/api/book/one?isbn=${isbn}&manual_search_mode=true`,
);

// 貸出情報確認
const loanResponse = await fetch(`/api/book/loan?isbn=${isbn}`);

// 書籍更新
const updateResponse = await fetch("/api/book", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    before_isbn: beforeIsbn,
    isbn: newIsbn,
    title: newTitle,
    author: newAuthor,
  }),
});
```

### 8.3 一括登録機能 (`collectiveRegister.js`)

#### 8.3.1 登録方式

1. **CSVファイル登録（上書き）**
   - 既存データをすべて削除
   - CSVファイルの内容で完全上書き
2. **テキスト入力登録（追加）**
   - 既存データを保持
   - 新しい書籍のみ追加

#### 8.3.2 CSV形式

```
ISBN,タイトル,著者
9784873117720,情報アーキテクチャ,Louis Rosenfeld
9784167159005,吾輩は猫である,夏目漱石
```

#### 8.3.3 期限設定

- **管理者ユーザー**: 貸出期限14日後
- **一般ユーザー**: 貸出期限7日後

### 8.4 バーコード読取機能 (`readCode.js`)

#### 8.4.1 QuaggaJS設定

```javascript
Quagga.init({
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: document.querySelector("#interactive"),
  },
  decoder: {
    readers: ["code_128_reader"],
  },
});
```

#### 8.4.2 読取フロー

1. ユーザーバーコード読取（10桁）
2. 書籍バーコード読取（ISBN）
3. 貸出処理実行
4. 結果表示

## 9. スタイリング仕様

### 9.1 CSS構成

```
src/
├── styles/
│   ├── main.css          # メインスタイル
│   ├── bookList.css      # 書籍一覧スタイル
│   ├── editBook.css      # 書籍編集スタイル
│   ├── generateCard.css  # カード生成スタイル
│   ├── readCode.css      # バーコード読取スタイル
│   └── registers.css     # 登録画面スタイル
└── fonts/
    └── fonts.css         # フォント定義
```

### 9.2 レスポンシブ対応

```css
/* デスクトップ */
@media (min-width: 1200px) {
}

/* タブレット */
@media (min-width: 768px) and (max-width: 1199px) {
}

/* モバイル */
@media (max-width: 767px) {
}
```

## 10. ブラウザ対応

### 10.1 サポートブラウザ

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### 10.2 必要な機能

- **Fetch API**: 非同期通信
- **ES6+**: モダンJavaScript機能
- **CSS Grid/Flexbox**: レイアウト
- **WebRTC**: カメラアクセス（バーコード読取）

## 11. パフォーマンス最適化

### 11.1 画像最適化

- 画像の遅延読み込み
- 適切な画像サイズとフォーマット

### 11.2 JavaScript最適化

- コードの分割と遅延読み込み
- イベントデリゲーションの使用
- メモリリークの防止

### 11.3 CSS最適化

- CSSの最小化
- クリティカルCSSのインライン化
- 不使用CSSの削除

## 12. セキュリティ

### 12.1 XSS対策

- ユーザー入力の適切なエスケープ
- CSP（Content Security Policy）の設定

### 12.2 CSRF対策

- CSRFトークンの使用
- SameSite Cookie属性

### 12.3 データ検証

- クライアント側での入力検証
- サーバー側での再検証

## 13. エラーハンドリング

### 13.1 ネットワークエラー

- オフライン時の表示
- リトライ機能

### 13.2 APIエラー

- 適切なエラーメッセージ表示
- ユーザーフレンドリーなエラー処理

### 13.3 バリデーションエラー

- リアルタイムバリデーション
- エラー箇所のハイライト

## 14. テスト

### 14.1 ユニットテスト

- JavaScript関数のテスト
- API通信のモックテスト

### 14.2 統合テスト

- ユーザーフローのテスト
- ブラウザ互換性テスト

### 14.3 E2Eテスト

- 完全なユーザーシナリオテスト
- 自動化テストの実装

## 15. デプロイ

### 15.1 ビルドプロセス

- CSS/JSの最小化
- 画像の最適化
- ファイルの結合

### 15.2 環境設定

- 開発環境
- ステージング環境
- 本番環境

### 15.3 監視

- エラーログの収集
- パフォーマンス監視
- ユーザー行動分析

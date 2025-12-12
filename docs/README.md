![Kashidasu Logo](./images/KashidasuLogo.png)
## プロジェクト概要
自分が通う高校の図書館で実際に稼働している図書管理システム。
ISBNコードで管理するのが特徴。

**開発背景:**
高校の図書管理アプリには学校にとって使いずらいという課題があり、
この課題を解決するため、WebベースのシステムとしてKashidasuを開発した。

## システム構成
- フロントエンド: EJS (サーバーサイドレンダリング)
- バックエンド: Node.js + Express
- データベース: MySQL
- ツール類: Docker

## 技術スタック
**フロントエンド:**
- EJS, Quagga.js(バーコード読み取り)

**バックエンド:**
- Node.js 18.x
- Express 4.x
- MySQL 8.0

**インフラ:**
- Docker & Docker Compose

**技術選定の理由:**
- Node.js: 高校で習う言語がJavaScriptのため、このアプリを長生きさせるために、後輩に少しでもメンテナンスしやすくするために選定
- MySQL: 技術的好奇心
- Docker: 環境構築がすごく楽だから

## 今後の機能改善予定
- 利用統計ダッシュボード機能の追加

## ディレクトリ構成
```
Kashidasu/
├── src/
│   ├── routes/      # ルーティング
│   ├── models/      # データベースモデル
│   ├── views/       # EJSテンプレート
│   └── utils/       # ユーティリティ関数
├── docker/          # Docker設定
└── tests/           # テストコード
```

## 開発の経緯と学び
このプロジェクトを通じて以下を学びました:
- 実際のユーザーの要望をヒアリングし、要件に落とし込む力
- データベース設計
- バックエンドの知識の獲得
- 運用中のシステムへの機能追加とリリース戦略

## 開発者
ゆっきー ([@yukki_marshal](https://twitter.com/yukki_marshal))


## セットアップ
### 必要要件
* Docker engineがインストールされていること
* Docker compose pluginがインストールされていること(Docker engineに大抵付属している)
* MacまたはWindowsまたはLinux系OSがインストールされているパソコン, サーバーで稼働させること
* ChromeまたはEdgeのブラウザがインストールされていること

### 導入
Githubからリポジトリをクローン

    git clone https://github.com/yukki072417/Kashidasu.git

Kashidasuのディレクトリに移動

    cd Kashidasu

Kashidasuのビルドとコンテナ立ち上げ

    docker compose up -d --build

docker composeでコンテナ立ち上げたら、自動的にサーバが起動するようにしています。

## ブラウザでのアクセス方法

### 自分でサーバーを立ち上げている場合
自分からPCアクセスするには、ブラウザのURL入力欄に以下のアドレスを入力してください

    https://localhost

### 他のPC・（LAN内に存在する）サーバーで立ち上げている場合
他のPCにアクセスするには、サーバーを立ち上げたプライベートipアドレスを知る必要があります。サーバーを立ち上げたPCでこちらのコマンドを入力してください

    ipconfig
そうすると、このような出力がされると思います（windowsの場合）

    Windows IP 構成
    （略）
    IPv4 アドレス . . . . . . . . . . . .: XXX.XXX.XXX.XXX <-これがIPv4のIPアドレス
    （略）
IPv4の値がIPv4のアドレスです。こちらをアクセス元のPCのブラウザにあるURL入力欄に
以下を入力してください

    https://<IPv4のIPアドレス>

また、MacOS, Linuxの場合も基本的なやり方は同じです。私はwindows信者なので、READMEでの説明はwindows以外省略します。

また、Android, iOSなどのスマホ・iPadなどのスマートフォンでは対応していません。そのうち対応させます。

### .envファイルの作成
.envファイルは、ダウンロード直後の初期状態では含まれておりません、。.envファイル方法は以下の説明にそって書いてください <br>
#### (例)

    ROOT_PASSWORD=fjeA23jIod30
    TIME_ZONE=Asia/Tokyo

1. ROOT_PASSWORDは不規則で、英字や数字などを含んだ推測されにくい12文字以上のパスワードを使用することを**強く推奨します**。
2. TIME_ZONEはあなたが日本でお住まいである限り、例の通り記述してもらって構いません

## 補足情報
ブラウザでアクセスすると、**「接続がプライベートではありません」** のような表示がされますが、ローカル（LAN内）のネットワークで動かす場合は、構造上の都合上表示されているだけで、動作に影響はありません。

「詳細設定」をクリックし「...に進む(安全ではありません)」をクリックして、Kashidasuにアクセスしてください
![Warning](./images/warning.png)

## 利用OSSライブラリとライセンス

本ソフトウェアは以下のOSSライブラリを利用しています。  
各ライブラリの著作権表示およびライセンス条項は、それぞれのリポジトリまたはnpmパッケージに従います。

- @pdf-lib/fontkit (MIT License)
- canvas (MIT License)
- dotenv (MIT License)
- ejs (Apache-2.0 License)
- express (MIT License)
- express-session (MIT License)
- jsbarcode (MIT License)
- log4js (Apache-2.0 License)
- mysql2 (MIT License)
- pdf-lib (MIT License)
- pdf-poppler (MIT License)
- pdf2pic (MIT License)
- ほか package.json 記載の各ライブラリ

詳細は node_modules ディレクトリ内の各ライブラリの LICENSE ファイルをご参照ください。


## 📈 運用実績と改善
**リリース後の改善:**
- beta-v1.0.0 (2025年7月): 初回リリース
- beta-v1.1.0 (2025年9月): バーコードリーダーでの読み取り機能を実装
- beta-v1.2.0 (現在): CSVによる一括登録機能追加

## 現在の利用状況
蔵書登録数: 現在図書委員が頑張って登録しています（約1000冊中30冊くらい？）  
利用ユーザー: 学校にいる図書委員(約15人)

## ユーザーの声
- バーコードリーダーで読み取れるのが使いやすかった

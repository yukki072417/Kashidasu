![Kashidasu Logo](./images/KashidasuLogo.png)
## 概要
図書室での導入を想定した図書管理アプリで、主に以下のような特徴があります。
* 必要最低限の機能のみ搭載したシンプルな機能
* Chrome, Edgeがインストールされている環境であれば使用できるwebアプリ

## 最新バージョン(v1.0.0-beta)での実装機能
1. webカメラを使用したISBN-13コードの読み取り機能
2. 1.を使用して本の状態（貸出・返却の状態）管理機能
. CSVファイル使用した本を一括でデータベースに登録する機能
4. 1.を使用した本の登録

## 導入方法
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

## 著作権
ベータ版Kashidasu（Kashidasu-beta）は、著作権法に基づき著作権が保護されます。また、本アプリの利用・再配布はMIT License（MITライセンス）の条件に従います。

## 開発者

#### ゆっきー
仕事用? メールアドレス: yukki.maybe.engineer@gmail.com<br>
なお案件は承っておりません。高校3年生の受験生ですので。
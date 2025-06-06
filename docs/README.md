![alt text](./images/KashidasuLogo.png)
## 概要
図書室での導入を想定した図書管理アプリで、主に以下のような特徴があります。
* 必要最低限の機能のみ搭載したシンプルな機能
* Chrome, Edgeがインストールされている環境であれば使用できるwebアプリ

## 最新バージョン(v1.0)での実装機能
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

## 補足情報
ブラウザでアクセスすると、**「接続がプライベートではありません」** のような表示がされますが、ローカル（LAN内）のネットワークで動かす場合は、構造上の都合上表示されているだけで、動作に影響はありません。

「詳細設定」をクリックし「...に進む(安全ではありません)」をクリックして、Kashidasuにアクセスしてください
![alt text](./images/warning.png)

## 開発者

#### ゆっきー
仕事用? メールアドレス: yukki.maybe.engineer@gmail.com

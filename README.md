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

### 導入
Githubからリポジトリをクローン

    git clone https://github.com/yukki072417/Kashidasu.git

Kashidasuのディレクトリに移動

    cd Kashidasu

Kashidasuのビルドとコンテナ立ち上げ

    docker compose up -d --build

docker composeでコンテナ立ち上げたら、自動的にサーバが起動するようにしています。

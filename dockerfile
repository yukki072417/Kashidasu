# Raspberry Pi 5 (arm64) 用, Mac(Apple silicon)専用
# FROM arm64v8/node:23

# Mac(Intel chip), Windows, Linux専用
FROM node:23

WORKDIR /usr/app/

COPY . /usr/app/

# 必要なシステムパッケージのインストール
RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    build-essential \
    g++ \
    graphicsmagick \
    imagemagick \
    poppler-utils \
    libpoppler-cpp-dev \
    libmysqlclient-dev \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# node_modules やキャッシュのクリーンアップ
RUN rm -rf node_modules package-lock.json && npm cache clean --force

# node-gyp のインストール（ネイティブモジュールのビルドに必要）
RUN npm install -g node-gyp

# 依存関係のインストール
RUN npm install

# アプリケーション起動（必要に応じて）
# CMD ["npm", "start"]

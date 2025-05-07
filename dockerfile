FROM node:23

WORKDIR /usr/app/

COPY . /usr/app/

# 必要なライブラリをインストール
RUN apt-get update && apt-get install -y \
    libnode108 \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    build-essential \
    g++ \
    graphicsmagick \
    imagemagick \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 不要なキャッシュを削除
RUN rm -rf node_modules package-lock.json && npm cache clean --force

# node-gyp と依存関係をインストール
RUN npm install -g node-gyp
RUN npm install
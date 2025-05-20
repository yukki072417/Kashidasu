FROM node:23

WORKDIR /usr/app/

COPY . /usr/app/

# 必要なライブラリのインストール
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

# npmパッケージ等のクリーンアップとインストール
RUN rm -rf node_modules package-lock.json && npm cache clean --force
RUN npm install -g node-gyp
RUN npm install

# HTTPS証明書は docker-compose.yml でホスト側の "./certs" をマウントして供給するのでここでのコピーは不要

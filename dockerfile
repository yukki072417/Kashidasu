# ARM64対応の軽量Node.jsベースイメージ
FROM arm64v8/node:20-bullseye-slim

WORKDIR /usr/app/

# canvas・pureimageが依存するシステムライブラリをインストール
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    build-essential \
    netcat-openbsd \
    node-gyp \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# パッケージインストール
COPY package*.json ./
RUN npm install

# アプリケーションコードの配置
COPY . /usr/app/

CMD ["npm", "start"]

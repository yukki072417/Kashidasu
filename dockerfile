# FROM node:20-bullseye-slim
FROM arm64v8/node:20-bullseye-slim

WORKDIR /usr/app/

# 必要なパッケージをインストール
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    default-mysql-client && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

# アプリケーションコードの配置
COPY . /usr/app/

CMD ["nodemon", "src/app.js"]
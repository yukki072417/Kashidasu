#IntelなどのCPUが使用されている場合こちらを使用する
FROM node:20-bullseye-slim

# Apple Silicon, Raspberry piなどで稼働させる場合はこちら
# FROM arm64v8/node:20-bullseye-slim

WORKDIR /usr/app/

# 必要なパッケージをインストール
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    default-mysql-client && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

COPY ./src/ /usr/app/src/
COPY ./logs/ /usr/app/logs/
COPY ./config/ /usr/app/config/
COPY ./nodemon.json /usr/app/nodemon.json

RUN npm install

CMD ["nodemon", "src/app.js"]
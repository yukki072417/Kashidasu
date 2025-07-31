# Raspberry Pi 5（ARM64）に適したNode.jsベースイメージ
FROM arm64v8/node:20-bullseye-slim

WORKDIR /usr/app/

# 必要なツールのインストール（今回は canvas 不使用なので画像系ライブラリは不要）
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    netcat-openbsd \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# nodemon をグローバルにインストール
RUN npm install -g nodemon

# パッケージのインストール（`pdf-lib` を含める）
COPY package*.json ./
RUN npm install pdf-lib

# 起動スクリプトなどの準備
COPY wait-for-services.sh /usr/app/
RUN chmod +x /usr/app/wait-for-services.sh

# アプリケーションコードの配置
COPY . /usr/app/

ENTRYPOINT ["bash", "/usr/app/wait-for-services.sh"]
CMD ["nodemon", "src/app.js"]

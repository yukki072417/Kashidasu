FROM node:20-bullseye-slim

WORKDIR /usr/app/

# 必要な依存パッケージ + GraphicsMagick + Ghostscript
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    build-essential \
    netcat-openbsd \
    python3 \
    g++ \
    graphicsmagick \
    ghostscript \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*
 
COPY package*.json ./
RUN npm install pdf-lib

# 起動スクリプトなどの準備
COPY wait-for-services.sh /usr/app/
RUN chmod +x /usr/app/wait-for-services.sh

# アプリケーションコードの配置
COPY . /usr/app/

ENTRYPOINT ["bash", "/usr/app/wait-for-services.sh"]
CMD ["nodemon", "src/app.js"]
# Raspberry Pi 5 (ARM64) に最適化されたNode.jsイメージを使用
FROM arm64v8/node:20-bullseye-slim

WORKDIR /usr/app/

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    netcat-openbsd \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    build-essential \
    graphicsmagick \
    imagemagick \
    ghostscript \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# nodemon, node-gyp をグローバルにインストール
RUN npm install -g nodemon node-gyp

COPY package*.json ./
RUN npm install

COPY wait-for-services.sh /usr/app/
RUN chmod +x /usr/app/wait-for-services.sh

COPY . /usr/app/

ENTRYPOINT ["bash", "/usr/app/wait-for-services.sh"]
CMD ["nodemon", "src/app.js"]

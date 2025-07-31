FROM arm64v8/node:20-bullseye-slim

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
RUN npm install

COPY . /usr/app/

CMD ["npm", "start"]
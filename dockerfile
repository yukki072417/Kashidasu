FROM node:23

WORKDIR /usr/app/

COPY . /usr/app/

# 必要なライブラリのインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
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

RUN npm install -g node-gyp
RUN npm install
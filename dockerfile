FROM node:23
WORKDIR /usr/app/

# netcat は debian でパッケージ名が netcat-openbsd
# 最終行にバックスラッシュを残さないように注意
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

# nodemon と node-gyp をグローバルインストール
RUN npm install -g nodemon node-gyp

# 依存パッケージを先にインストール
COPY package*.json ./
RUN npm install

# 待機スクリプトとアプリ本体をコピー
COPY wait-for-services.sh /usr/app/wait-for-services.sh
RUN chmod +x /usr/app/wait-for-services.sh

COPY . /usr/app/

# 起動時に依存サービスを待ってから nodemon を実行
ENTRYPOINT ["bash", "/usr/app/wait-for-services.sh"]
CMD ["nodemon", "src/app.js"]

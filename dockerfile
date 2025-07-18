# Raspberry Pi 5 (arm64) 用, Mac(Apple silicon)専用
# FROM arm64v8/node:23

# Mac(Intel chip), Windows, Linux専用
FROM node:23

WORKDIR /usr/app/

COPY . /usr/app/

RUN apt-get update && apt-get install -y \
    imagemagick \
    liblcms2-2 \
    libfontconfig1 \
    fontconfig-config \
    libjbig0 \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

RUN rm -f /etc/fonts/conf.d/*.conf \
&& dpkg-reconfigure fontconfig
# node_modules やキャッシュのクリーンアップ
RUN rm -rf node_modules package-lock.json && npm cache clean --force

# node-gyp のインストール（ネイティブモジュールのビルドに必要）
RUN npm install -g node-gyp

# 依存関係のインストール
RUN npm install

# アプリケーション起動（必要に応じて）
# CMD ["npm", "start"]

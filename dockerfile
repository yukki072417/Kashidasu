FROM arm64v8/node:20-bullseye-slim

WORKDIR /usr/app/

# 依存するパッケージを修正
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    netcat-openbsd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
 
COPY package*.json ./
RUN npm install

# アプリケーションコードの配置
COPY . /usr/app/

ENTRYPOINT ["bash", "/usr/app/wait-for-services.sh"]

CMD ["nodemon", "src/app.js"]
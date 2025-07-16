FROM arm64v8/node:23

WORKDIR /usr/app/

COPY . /usr/app/

RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    build-essential \
    g++ \
    graphicsmagick \
    imagemagick \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN rm -rf node_modules package-lock.json && npm cache clean --force
RUN npm install -g node-gyp
RUN npm install

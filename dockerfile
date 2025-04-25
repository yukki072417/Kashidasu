FROM node:20

WORKDIR /usr/app/

COPY package.json /usr/app/
COPY package-lock.json /usr/app/

RUN apt update && apt install -y libnode108 
RUN apt-get update && apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++
RUN rm -rf node_modules package-lock.json && npm cache clean --force

RUN npm install -g node-gyp
RUN npm install
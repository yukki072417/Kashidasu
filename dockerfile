FROM node:latest

WORKDIR /usr/app/

COPY package.json /usr/app/
COPY package-lock.json /usr/app/

RUN apt update && apt install -y libnode108

# RUN apt install python3 build-essential
RUN npm install -g node-gyp

#RUN apt-get update && \
#    apt-get install -y bash && \
#    apt-get clean && \
#    rm -rf /var/lib/apt/lists/*
    
# RUN rm -rf node_modules package-lock.json && npm cache clean --force

# RUN apt-get update && apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++

#RUN apt-get update && \
#    apt-get install -y graphicsmagick imagemagick && \
#    apt-get clean && \
#    rm -rf /var/lib/apt/lists/*
#
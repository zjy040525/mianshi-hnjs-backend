FROM node:18-alpine as builder

RUN apk add tzdata \
  && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo Asia/Shanghai > /etc/timezone \
  && apk add ca-certificates \
  && apk del tzdata

WORKDIR /app

COPY package*.json /app/

RUN npm config set registry https://mirrors.cloud.tencent.com/npm/  \
  && npm install

COPY . /app

CMD ["npm", "start"]

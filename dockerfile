FROM node:22-alpine3.19

WORKDIR /usr/src/app

COPY ./package-lock.json ./
COPY ./package.json ./
COPY ./prisma ./

RUN npm install

COPY . .

EXPOSE 3001

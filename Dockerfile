FROM node:22.21.1-alpine3.21
WORKDIR /app
COPY index.js .
COPY package.json .

RUN npm install
CMD node index.js
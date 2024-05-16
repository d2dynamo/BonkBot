FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production

COPY ./dist/bundle.js .

CMD ["node", "bundle.js"]

FROM node:20

WORKDIR /app

COPY ./dist/bundle.js .
COPY ./package.json .

CMD ["node", "bundle.js"]

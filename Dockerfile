FROM node:20

WORKDIR /app

COPY ./dist/bundle.js .

CMD ["node", "bundle.js"]

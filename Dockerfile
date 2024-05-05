FROM node:20

WORKDIR /dist

CMD ["node","bundle.js"]
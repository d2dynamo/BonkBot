# BonkBot

Discord bot thingamajig.

# Running the bot

Evnironment variables required found in /src/types/environment.d.ts

## Locally

git clone {this repo url}  
npm install  
npm run start

## Docker

docker pull ghcr.io/d2dynamo/bonkbot:main  
write your docker-compose file.  
docker compose up -f {your docker-compose file}

## Deploying bundled

Do not use esbuild minify, it upsets up discord.js code somehow. Terser works instead.

git clone {this repo url}  
npm run build-local (on windows machine, must create /dist and /build folders first. will fix later)  
npm run build (on unix system)  
node ./dist bundle.js (dont forget to add your env variables)

# TODO

## Guild based config.

Which means gamer words and wallets need guild binds.

## GamerWordCollections

Select server gamer words based on collection ex: "Hate Speech" selects hate speech worsd for the server.

## Commands options type checking

Command options need to be type checked in code and then asserted since we have to use the generic options.get() command.
Maybe implement options resolver in Command class?

## Implement localization

Write commands with localization in mind. Store localization strings in yaml or json.

## GamerWordWatch microservice

Use golang to handle gamer word watcher? (comms with grpc)

## Rewrite bot in golang?

Cause fun

# Commands

- bd-load | loads swear jar
- bd-set | sets debt in swear jar
- bd-add | adds to debt in swear jar
- bd-remove | remove debt from swear jar

- subscribe-gamer-word | Subscribe guild to gamer word
- list-gamer-words | List all available gamer words
- list-guild-words | List all words guild is subscribed to
- save-word-config | Change cost or response of a gamer word

- set-user-permission | Change user permission

# Other features

GamerWordWatch - Watches for any gamer words mentioned in text channels. Adds debt to a users wallet when gamer word spotted (basically swear jar).

# Database definition

https://dbdiagram.io/d/BonkBot-66425b189e85a46d55bca0e3

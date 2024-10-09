import { GamerWord as GameWordDoc } from "../../interfaces/database";
import GamerWord from "./gamerWord";
import connectCollection from "../database/mongo";

// Cache words so that we don't have to query the database on every message.
const cachedWords: GamerWord[] = [];
const cacheTime = 1000 * 60 * 60 * 24 * 1; // 1 days
let lastCache = Date.now() - cacheTime; // force update on first call, aka bot just started.
let isCacheUpdating = false;

export async function listGamerWords(): Promise<GameWordDoc[]> {
  const coll = await connectCollection("gamerWords");

  const result = coll.find({});

  return await result.toArray();
}

export default async function listAndBuildGamerWords(): Promise<GamerWord[]> {
  if (Date.now() - lastCache < cacheTime && !isCacheUpdating) {
    console.log("Returning cached words", cachedWords.length);
    return cachedWords;
  }

  if (isCacheUpdating) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!isCacheUpdating) {
          clearInterval(interval);
          resolve(cachedWords);
        }
      }, 200);
    });
  }

  try {
    isCacheUpdating = true;
    console.log("updating word cache");

    const result = (await listGamerWords()).map((item) => {
      let optionals =
        item.response || item.createdAt || item.updatedAt
          ? {
              response: item.response,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            }
          : undefined;

      const gamerWord = new GamerWord(item.phrases, item.cost, optionals);
      return gamerWord;
    });

    cachedWords.splice(0, cachedWords.length, ...result);
    console.log("Updated cache with", cachedWords.length, "words");
    lastCache = Date.now();
    return result;
  } finally {
    isCacheUpdating = false;
  }
}

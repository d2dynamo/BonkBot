import {
  DiscordUID,
  GamerWord as GamerWordDoc,
} from "../../interfaces/database";
import GamerWord from "./gamerWord";
import connectCollection from "../database/mongo";
import { ObjectId, WithId } from "mongodb";

// Cache words so that we don't have to query the database on every message.

// ! Make map for guild separate words.
const cachedWords: GamerWord[] = [];
const cacheTime = 1000 * 60 * 60 * 24 * 1; // 1 days
let lastCache = Date.now() - cacheTime; // force update on first call, aka bot just started.
let isCacheUpdating = false;

export async function listGuildGamerWordsWOID(
  guildId: ObjectId
): Promise<GamerWordDoc[]> {
  const coll = await connectCollection("guildGamerWords");

  const pipe = [
    {
      $match: {
        guildId: guildId,
      },
    },
    {
      $unwind: "$gamerWordIds",
    },
    {
      $lookup: {
        from: "gamerWords",
        localField: "gamerWordIds",
        foreignField: "_id",
        as: "gamerWord",
      },
    },
    {
      $unwind: "$gamerWord",
    },
    {
      $lookup: {
        from: "gamerWordConfig",
        let: { guildId: "$guildId", gamerWordId: "$gamerWord._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$guildId", "$$guildId"] },
                  { $eq: ["$gamerWordId", "$$gamerWordId"] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
        as: "gamerWordConfig",
      },
    },
    { $unwind: { path: "$gamerWordConfig", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        "gamerWord.cost": {
          $ifNull: ["$gamerWordConfig.cost", "gamerWord.cost"],
        },
      },
      "gamerWord.response": {
        $ifNull: ["$gamerWordConfig.response", "gamerWord.response"],
      },
    },
  ];

  const cursor = coll.aggregate();

  const gWords: GamerWordDoc[] = [];

  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    if (!doc || !doc._id) {
      continue;
    }

    console.log("gamerWord:", doc);
  }

  return gWords;
}

interface GamerWordsAll extends GamerWordDoc {
  guildId: ObjectId;
  guildDID: DiscordUID;
}

export async function listGamerWordsFull(): Promise<WithId<GamerWordDoc>[]> {
  const coll = await connectCollection("gamerWords");

  const result = await coll.find({}).toArray();

  return result;
}

interface ListGamerWordsOptions {
  name: string; // word
  value: string; // _id
}

/**
 *  Primarily for use in command options dropdowns.
 * @returns {ListGamerWordsOptions[]} List of gamer words with only the word and _id.
 */
export async function listGamerWordsOptions(): Promise<
  ListGamerWordsOptions[]
> {
  const coll = await connectCollection("gamerWords");

  const cursor = coll.find(
    {},
    {
      projection: {
        _id: 1,
        word: 1,
      },
    }
  );

  const options: ListGamerWordsOptions[] = [];

  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    if (!doc || !doc._id) {
      continue;
    }

    options.push({
      name: doc.word,
      value: String(doc._id),
    });
  }

  return options;
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

    const result = (await listGamerWordsFull()).map((item) => {
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

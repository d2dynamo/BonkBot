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

interface GuildGamerWord extends GamerWordDoc {
  id: ObjectId;
}

export async function listGuildGamerWords(
  guidDID: DiscordUID
): Promise<GuildGamerWord[]> {
  const coll = await connectCollection("guilds");

  const pipe = [
    {
      $match: {
        discordId: guidDID,
      },
    },
    {
      $lookup: {
        from: "guildGamerWords",
        localField: "_id",
        foreignField: "guildId",
        as: "guildGamerWords",
      },
    },
    {
      $unwind: "$guildGamerWords",
    },
    {
      $lookup: {
        from: "gamerWords",
        localField: "guildGamerWords.gamerWordIds",
        foreignField: "_id",
        as: "gamerWords",
      },
    },
    {
      $unwind: "$gamerWords",
    },
    {
      $lookup: {
        from: "gamerWordConfig",
        let: { guildId: "$_id", gamerWordId: "$gamerWords._id" },
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
        "gamerWords.cost": {
          $ifNull: ["$gamerWordConfig.cost", "$gamerWords.cost"],
        },
      },
      "gamerWords.response": {
        $ifNull: ["$gamerWordConfig.response", "$gamerWords.response"],
      },
    },
  ];

  const cursor = coll.aggregate(pipe);

  const gWords: GuildGamerWord[] = [];

  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    if (!doc || !doc._id) {
      continue;
    }

    console.log("gamerWord:", doc);

    gWords.push({
      id: doc.gamerWords._id,
      word: doc.gamerWords.word,
      phrases: doc.gamerWords.phrases,
      cost: doc.gamerWords.cost,
      response: doc.gamerWords.response,
      createdAt: doc.gamerWords.createdAt,
      updatedAt: doc.gamerWords.updatedAt,
    });
  }

  return gWords;
}

export async function listGuildGamerWordsWOID(
  guildId: ObjectId
): Promise<GuildGamerWord[]> {
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

  const gWords: GuildGamerWord[] = [];

  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    if (!doc || !doc._id) {
      continue;
    }

    gWords.push({
      id: doc.gamerWord._id,
      word: doc.gamerWord.word,
      phrases: doc.gamerWord.phrases,
      cost: doc.gamerWord.cost,
      response: doc.gamerWord.response,
      createdAt: doc.gamerWord.createdAt,
      updatedAt: doc.gamerWord.updatedAt,
    });
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

export async function listGuildGamerWordsOptions(
  guildDID: DiscordUID
): Promise<ListGamerWordsOptions[]> {
  const coll = await connectCollection("guilds");

  const pipe = [
    {
      $match: {
        discordId: guildDID,
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
    {
      $lookup: {
        from: "guildGamerWords",
        localField: "_id",
        foreignField: "guildId",
        as: "guildGamerWords",
      },
    },
    {
      $unwind: { path: "$guildGamerWords.gamerWordIds", as: "gamerWordId" },
    },
    {
      $lookup: {
        from: "gamerWords",
        localField: "gamerWordId",
        foreignField: "_id",
        as: "gamerWords",
      },
    },
    {
      $unwind: "$gamerWords",
    },
    {
      $project: {
        _id: 1,
        word: "$gamerWords.word",
      },
    },
  ];

  const cursor = coll.aggregate(pipe);

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

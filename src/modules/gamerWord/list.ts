import {
  DiscordUID,
  GamerWord as GamerWordDoc,
} from "../../interfaces/database";
import GamerWord from "./gamerWord";
import connectCollection from "../database/mongo";
import { ObjectId, WithId } from "mongodb";
import MemoryCache from "../memcacher";
import { getGuildWithOID } from "../guild/get";

// Cache words so that we don't have to query the database on every message.

const cacheTimeMs = 1000 * 60 * 60 * 24;
const cache = MemoryCache.getInstance();

interface GuildGamerWord extends GamerWordDoc {
  id: ObjectId;
}

export async function listGuildGamerWords(
  guildDID: DiscordUID
): Promise<GuildGamerWord[]> {
  const lastCache = cache.getTime(guildDID);

  if (
    lastCache &&
    cache.has(guildDID) &&
    Date.now() - lastCache < cacheTimeMs
  ) {
    return cache.get(guildDID)!;
  }

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
      $unwind: "$_id",
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
        as: "gamerWord",
      },
    },
    {
      $unwind: "$gamerWord",
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
    {
      $project: {
        guildGamerWords: 0,
      },
    },
    { $unwind: { path: "$gamerWordConfig", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        "gamerWord.cost": {
          $ifNull: ["$gamerWordConfig.cost", "$gamerWord.cost"],
        },
        "gamerWord.response": {
          $ifNull: ["$gamerWordConfig.response", "$gamerWord.response"],
        },
      },
    },
  ];

  let guildOID: ObjectId | null = null;

  const cursor = coll.aggregate(pipe);

  const gWords: GuildGamerWord[] = [];

  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    if (!doc || !doc._id) {
      continue;
    }

    if (!guildOID) {
      guildOID = doc._id;
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

  if (guildOID) {
    cache.set(guildDID, gWords);
  }

  return gWords;
}

export async function listGuildGamerWordsWOID(
  guildId: ObjectId
): Promise<GuildGamerWord[]> {
  const guild = await getGuildWithOID(guildId);
  const lastCache = cache.getTime(guild.discordId);

  if (
    lastCache &&
    cache.has(guild.discordId) &&
    Date.now() - lastCache < cacheTimeMs
  ) {
    return cache.get(guild.discordId)!;
  }

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
      $project: {
        gamerWordIds: 0,
        createdAt: 0,
        updatedAt: 0,
      },
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
          $ifNull: ["$gamerWordConfig.cost", "$gamerWord.cost"],
        },
        "gamerWord.response": {
          $ifNull: ["$gamerWordConfig.response", "$gamerWord.response"],
        },
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

  cache.set(guild.discordId, gWords);
  return gWords;
}

export async function listAndBuildGamerWords(
  guildId: string | ObjectId
): Promise<GamerWord[]> {
  let words: GuildGamerWord[];
  if (guildId instanceof ObjectId) {
    words = await listGuildGamerWordsWOID(guildId);
  } else if (typeof guildId == "string") {
    words = await listGuildGamerWords(guildId);
  } else {
    throw Error("Invalid guildId.");
  }

  if (!words.length) {
    throw Error("no words found for guild.");
  }

  const gamerWords: GamerWord[] = [];

  for (let i = 0; i < words.length; i++) {
    const item = words[i];

    gamerWords.push(
      new GamerWord(item.phrases, item.cost, {
        response: item.response,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
    );
  }

  return gamerWords;
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
      $unwind: "$guildGamerWords.gamerWordIds",
    },
    {
      $lookup: {
        from: "gamerWords",
        localField: "gamerWordIds",
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

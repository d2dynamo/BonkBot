import { ObjectId } from "mongodb";
import { DiscordUID } from "../../interfaces/database";
import connectCollection from "../database/mongo";

export async function subscribeGamerWord(
  guildId: DiscordUID,
  gamerWordId: ObjectId
): Promise<boolean> {
  const guildsColl = await connectCollection("guilds");

  const guild = await guildsColl.findOne(
    { discordId: guildId },
    { projection: { _id: 1 } }
  );

  if (!guild || !guild._id) {
    throw new Error("Guild not found");
  }

  const gamerWordsColl = await connectCollection("guildGamerWords");

  const result = await gamerWordsColl.updateOne(
    { guildId: guild._id },
    {
      $addToSet: {
        gamerWordIds: gamerWordId,
      },
      $setOnInsert: {
        guildId: guild._id,
        createdAt: new Date(),
      },
      $set: {
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  return result.acknowledged;
}

export interface SaveGamerWordConfig {
  cost?: number;
  response?: string;
}

export async function saveGamerWordConfig(
  guildId: DiscordUID,
  gamerWordId: ObjectId,
  config: SaveGamerWordConfig
): Promise<boolean> {
  const guildsColl = await connectCollection("guilds");

  const guild = await guildsColl.findOne(
    {
      discordId: guildId,
    },
    { projection: { _id: 1 } }
  );

  if (!guild || !guild._id) {
    throw new Error("Guild not found");
  }

  const configColl = await connectCollection("gamerWordConfigs");

  const result = await configColl.updateOne(
    { guildId: guild._id, gamerWordId },
    {
      $set: {
        cost: config.cost,
        response: config.response,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        guildId: guild._id,
        gamerWordId,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  return result.acknowledged;
}

import { ObjectId } from "mongodb";
import { DiscordUID } from "../../interfaces/database";
import connectCollection from "../database/mongo";

export async function subscribeGamerWord(
  guildId: DiscordUID,
  gamerWordId: ObjectId
): Promise<void> {
  const guildsColl = await connectCollection("guilds");

  const guild = await guildsColl.findOne({ discordId: guildId });

  if (!guild || !guild._id) {
    throw new Error("Guild not found");
  }

  const gamerWordsColl = await connectCollection("guildGamerWords");

  const result = await gamerWordsColl.updateOne(
    { guildId: guild._id },
    {
      $addToSet: {
        gamerWords: gamerWordId,
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

  if (!result.acknowledged) {
    throw Error("Failed to subscribe gamer word");
  }

  return;
}

interface SetGamerWordConfig {
  cost?: number;
  response?: string;
}

export async function saveGamerWordConfig(
  guildId: DiscordUID,
  gamerWordId: ObjectId,
  config: SetGamerWordConfig
): Promise<void> {
  const guildsColl = await connectCollection("guilds");

  const guild = await guildsColl.findOne({
    discordId: guildId,
  });

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

  if (!result.acknowledged) {
    throw Error("Failed to save gamer word config");
  }

  return;
}

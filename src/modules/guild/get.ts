import { ObjectId } from "mongodb";
import connectCollection from "../database/mongo";
import { Guild } from "../../interfaces/database";

interface BonkGuild extends Omit<Guild, "discordId"> {
  id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export async function getGuild(guildDID: string): Promise<BonkGuild> {
  const coll = await connectCollection("guilds");

  const guild = await coll.findOne(
    { discordId: guildDID },
    {
      projection: {
        discordId: 0,
      },
    }
  );

  if (!guild) {
    throw new Error("Guild not found");
  }

  return {
    id: guild._id,
    name: guild.name,
    guildOwnerDID: guild.guildOwnerDID,
    createdAt: guild.createdAt,
    updatedAt: guild.updatedAt,
  };
}

export async function getGuildWithOID(guildId: ObjectId): Promise<Guild> {
  const coll = await connectCollection("guilds");

  const guild = await coll.findOne(
    { _id: guildId },
    {
      projection: {
        _id: 0,
        discordId: 1,
        name: 1,
        guildOwnerDID: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    }
  );

  if (!guild) {
    throw Error("Guild not found.");
  }

  return {
    discordId: guild.discordId,
    guildOwnerDID: guild.guildOwnerDID,
    name: guild.name,
    createdAt: guild.createdAt,
    updatedAt: guild.updatedAt,
  };
}

import { ObjectId } from "mongodb";
import connectCollection from "../database/mongo";
import { Guild } from "../../interfaces/database";

interface BonkGuild extends Omit<Guild, "discordId"> {
  id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export async function getGuild(gid: string): Promise<BonkGuild> {
  const coll = await connectCollection("guilds");

  const guild = await coll.findOne({ discordId: gid });

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

import { ObjectId } from "mongodb";
import connectCollection from "../database/mongo";
import { Guild } from "../../interfaces/database";

interface BonkGuild extends Guild {
  _id: ObjectId;
  discordId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getGuild(gid: string): Promise<BonkGuild> {
  const coll = await connectCollection("guilds");

  const guild = await coll.findOne({ discordId: gid });

  if (!guild) {
    throw new Error("Guild not found");
  }

  return guild;
}

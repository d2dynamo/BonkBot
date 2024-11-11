import { Guild } from "discord.js";

import createGuild from "./create";
import { getGuild } from "./get";
import { stringToObjectId } from "../database/mongo";

/**
 * Register guild to database.
 */
export default async function registerGuild(guild: Guild) {
  try {
    if (!(await getGuild(guild.id))) {
      createGuild(guild.id, guild.name);
    }
  } catch (error) {
    console.error(">> Error registering guild", error);
  }
}

import { Guild } from "discord.js";

import saveGuild from "./create";
import { getGuild } from "./get";

/**
 * Register guild to database.
 */
export default async function registerGuild(guild: Guild) {
  try {
    if (!(await getGuild(guild.id))) {
      await saveGuild(guild.id, guild.name);
    }
  } catch (error) {
    console.error(">> Error registering guild", error);
  }
}

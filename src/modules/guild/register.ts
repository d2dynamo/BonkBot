import { Guild } from "discord.js";

import saveGuild from "./create";

/**
 * Register guild to database.
 */
export default async function registerGuild(guild: Guild) {
  try {
    await saveGuild(guild.id, guild.name);
  } catch (error) {
    console.error(">> Error registering guild", error);
  }
}

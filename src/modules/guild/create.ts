import connectCollection from "../database/mongo";

/**
 * Create a Guild.
 * @param DiscordUID - Guild Discord UID.
 * @param guildName - Guild name.
 */
export default async function saveGuild(
  DiscordUID: string,
  guildName?: string
): Promise<true> {
  const coll = await connectCollection("guilds");

  const result = await coll.updateOne(
    { discordId: DiscordUID },
    {
      $set: {
        discordId: DiscordUID,
        name: guildName || "",
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  if (!result.upsertedId && !result.modifiedCount) {
    throw new Error("Failed to create or update guild");
  }

  return true;
}

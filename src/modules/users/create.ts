import { DiscordUID } from '../../interfaces/database';
import parseDiscordUID from '../discordUID';
import connectCollection from '../database/mongo';
/**
 * Create or update a user.
 * @param DiscordUID - Discord UID.
 * @param guildDID - Guild ID.
 * @param userName - Discord handle without tag.
 * @param displayName - Discord display name.
 */
export default async function saveUser(
  DiscordUID: DiscordUID,
  guildDID: DiscordUID,
  userName?: string,
  displayName?: string
): Promise<true> {
  parseDiscordUID(DiscordUID);
  parseDiscordUID(guildDID);

  const coll = await connectCollection('users');

  const result = await coll.updateOne(
    { discordId: DiscordUID, guildDID: guildDID },
    {
      $set: {
        discordId: DiscordUID,
        guildDID: guildDID,
        userName: userName,
        displayName: displayName,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  if (!result.upsertedId && !result.modifiedCount) {
    throw new Error('Failed to create or update user');
  }

  return true;
}

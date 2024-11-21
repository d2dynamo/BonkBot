import { DiscordUID } from "../../interfaces/database";
import parseDiscordUID from "../discordUID";
import connectCollection from "../database/mongo";
import { ObjectId } from "mongodb";

/**
 * Create or update a user.
 * @param DiscordUID - Discord UID.
 * @param guildDID - Guild ID.
 * @param userName - Discord handle without tag.
 */
export default async function saveUser(
  DiscordUID: DiscordUID,
  guildDID: DiscordUID,
  userName?: string
): Promise<true> {
  parseDiscordUID(DiscordUID);
  parseDiscordUID(guildDID);

  const coll = await connectCollection("users");

  const result = await coll.updateOne(
    { discordId: DiscordUID, guildDID: guildDID },
    {
      $set: {
        discordId: DiscordUID,
        guildDID: guildDID,
        userName: userName,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  if (!result.upsertedId && !result.modifiedCount) {
    throw new Error("Failed to create or update user");
  }

  return true;
}

// /**
//  * Create a new user.
//  * @param DiscordUID - Discord UID.
//  * @param userName - Discord handle without tag.
//  * @returns A promise that resolves to a boolean indicating success.
//  * @deprecated Old sqlite func.
//  */
// export async function createUserOld(DiscordUID: DiscordUID, userName?: string) {
//   parseDiscordUID(DiscordUID);
//   const db = drizzledb(DatabaseType.bonkDb);

//   const result = await db
//     .insert(users)
//     .values({
//       id: DiscordUID,
//       userName: userName,
//     })
//     .onConflictDoUpdate({
//       target: [users.id],
//       set: {
//         userName: sql`excluded.userName`,
//         updatedAt: sql`strftime('%s','now')`,
//       },
//     });

//   if (!result.changes) {
//     throw new Error("Failed to create user");
//   }

//   return true;
// }

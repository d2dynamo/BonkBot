import { sql } from "drizzle-orm";

import drizzledb, { DatabaseType } from "../database/drizzle";
import { users } from "../database/schema";
import { DiscordUID } from "../../interfaces/database";
import parseDiscordUID from "./userId";
import connectCollection from "../database/mongo";

/**
 * Create or update a user.
 * @param DiscordUID - Discord UID.
 * @param userName - Discord handle without tag.
 */
export default async function saveUser(
  DiscordUID: DiscordUID,
  userName?: string
): Promise<true> {
  parseDiscordUID(DiscordUID);

  const coll = await connectCollection("users");

  const result = await coll.updateOne(
    { _id: DiscordUID },
    {
      _id: DiscordUID,
      userName: userName,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { upsert: true }
  );

  if (!result.upsertedId && !result.modifiedCount) {
    throw new Error("Failed to create or update user");
  }

  return true;
}

/**
 * Create a new user.
 * @param DiscordUID - Discord UID.
 * @param userName - Discord handle without tag.
 * @returns A promise that resolves to a boolean indicating success.
 * @deprecated Old sqlite func.
 */
export async function createUserOld(DiscordUID: DiscordUID, userName?: string) {
  parseDiscordUID(DiscordUID);
  const db = drizzledb(DatabaseType.bonkDb);

  const result = await db
    .insert(users)
    .values({
      id: DiscordUID,
      userName: userName,
    })
    .onConflictDoUpdate({
      target: [users.id],
      set: {
        userName: sql`excluded.userName`,
        updatedAt: sql`strftime('%s','now')`,
      },
    });

  if (!result.changes) {
    throw new Error("Failed to create user");
  }

  return true;
}

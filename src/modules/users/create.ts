import drizzledb, { DatabaseType } from "../database/drizzle";
import { users } from "../database/schema";
import { UserId } from "../../interfaces/database";
import parseUserId from "./userId";
import { sql } from "drizzle-orm";

/**
 * Create a new user.
 * @param discordUID - Discord UID.
 * @param userName - Discord handle without tag.
 * @returns A promise that resolves to a boolean indicating success.
 */
export default async function createUser(
  discordUID: UserId,
  userName: string | null = null
) {
  parseUserId(discordUID);
  const db = drizzledb(DatabaseType.bonkDb);

  const result = await db
    .insert(users)
    .values({
      id: discordUID,
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

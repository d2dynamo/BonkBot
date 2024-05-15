import drizzledb, { DatabaseType } from "../database/drizzle";
import { users } from "../database/schema";
import { UserId } from "../../interfaces/database";
import parseUserId from "./userId";

/**
 * Create a new user.
 * @param discordUID - Discord UID.
 * @returns A promise that resolves to a boolean indicating success.
 */
export default async function createUser(discordUID: UserId) {
  parseUserId(discordUID);
  const db = drizzledb(DatabaseType.bonkDb);

  const result = await db.insert(users).values({
    id: discordUID,
  });

  if (!result.changes) {
    throw new Error("Failed to create user");
  }

  return true;
}

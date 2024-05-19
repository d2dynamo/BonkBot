import drizzledb, { DatabaseType } from "../database/drizzle";
import { users } from "../database/schema";
import { UserId } from "../../interfaces/database";
import parseUserId from "../users/userId";

/**
 * Create a new user.
 * @param discordUID - Discord UID.
 * @returns A promise that resolves to a boolean indicating success.
 */
export default async function createUserPermission(
  discordUID: UserId,
  permissionId: number
) {
  parseUserId(discordUID);
  const db = drizzledb(DatabaseType.bonkDb);

  const result = await db.insert(userPermission).values({
    id: discordUID,
  });

  if (!result.changes) {
    throw new Error("Failed to create user permissions");
  }

  return true;
}

import drizzledb, { DatabaseType } from "../database/drizzle";

import { users } from "../database/schema";
import parseUserId from "./userId";
import { User, UserId } from "../../interfaces/database";
import { eq } from "drizzle-orm";

/**
 * Get user by id or discord uid.
 * Must get user id from here if you need userId for other operations.
 * @param id discord uid
 * @returns User object
 */
export default async function getUser(id: UserId): Promise<User> {
  parseUserId(id);

  const db = drizzledb(DatabaseType.bonkDb);

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (userResult.length === 0) {
    throw new Error("User not found");
  }

  return userResult[0];
}

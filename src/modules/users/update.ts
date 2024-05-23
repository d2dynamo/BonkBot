import { sql } from "drizzle-orm";

import drizzledb, { DatabaseType } from "../database/drizzle";
import { userPermissions } from "../database/schema";
import { UserId } from "../../interfaces/database";
import parseUserId from "./userId";
import getUser from "./get";

interface permissionStatus {
  permissionId: number;
  active: boolean;
}

export async function changeUserPermissions(
  userId: UserId,
  permissionsStatus: permissionStatus[]
): Promise<boolean> {
  parseUserId(userId);
  await getUser(userId);

  const db = drizzledb(DatabaseType.bonkDb);

  const values = permissionsStatus.map((perm) => {
    return {
      userId: userId,
      permissionId: perm.permissionId,
      active: perm.active,
    };
  });

  const result = await db
    .insert(userPermissions)
    .values(values)
    .onConflictDoUpdate({
      target: [userPermissions.userId, userPermissions.permissionId],
      set: {
        active: sql`excluded.active`,
        updatedAt: sql`strftime('%s','now')`,
      },
    });

  if (!result) {
    throw new Error("Failed to update permissions");
  }

  return true;
}

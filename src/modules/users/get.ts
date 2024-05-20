import drizzledb, { DatabaseType } from "../database/drizzle";

import { userPermissions, users } from "../database/schema";
import parseUserId from "./userId";
import { User, UserId } from "../../interfaces/database";
import { eq, sql } from "drizzle-orm";

import { PermissionsEnum } from "../permissions/permissions";

interface UserWithPerms extends User {
  permissions: {
    id: PermissionsEnum;
    active: boolean;
    createdAt: number;
    updatedAt: number;
  }[];
}

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

export async function getUserWithPermissions(
  id: UserId
): Promise<UserWithPerms> {
  parseUserId(id);

  const db = drizzledb(DatabaseType.bonkDb);

  const userResult = await db
    .select({
      id: users.id,
      userName: users.userName,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      permission: {
        id: userPermissions.permissionId,
        active: userPermissions.active,
        createdAt: userPermissions.createdAt,
        updatedAt: userPermissions.updatedAt,
      },
    })
    .from(users)
    .where(eq(users.id, id))
    .leftJoin(userPermissions, eq(users.id, userPermissions.userId))
    .limit(1);

  if (userResult.length === 0) {
    throw new Error("User not found");
  }

  const returnObj: UserWithPerms = {
    id: userResult[0].id,
    userName: userResult[0].userName,
    createdAt: userResult[0].createdAt,
    updatedAt: userResult[0].updatedAt,
    permissions: userResult
      .map((item) => {
        if (!item.permission) {
          return {
            id: 0,
            active: false,
            createdAt: 0,
            updatedAt: 0,
          };
        }
        return {
          id: item.permission.id,
          active: item.permission.active,
          createdAt: item.permission.createdAt,
          updatedAt: item.permission.updatedAt,
        };
      })
      .filter((item) => item.id !== 0),
  };

  return returnObj;
}

export async function checkUserPermission(
  userId: UserId,
  permission: PermissionsEnum
): Promise<boolean> {
  await getUser(userId);

  const db = drizzledb(DatabaseType.bonkDb);

  let sQuery = sql`
    ${userPermissions.userId} = ${userId} AND ${userPermissions.permissionId} = ${permission}
    `;

  const permResult = await db
    .select({
      active: userPermissions.active,
    })
    .from(userPermissions)
    .where(
      sql`${userPermissions.userId} = ${userId} AND ${userPermissions.permissionId} = ${permission}`
    );

  return permResult.length > 0 && permResult[0].active;
}

function buildPermissionQuery(userId: UserId, perm: PermissionsEnum) {
  let sQuery = sql`
    ${userPermissions.userId} = ${userId} AND ${userPermissions.permissionId} = ${perm}
    `;

  switch (perm) {
    case PermissionsEnum.basic:

    case PermissionsEnum.admin:
    case PermissionsEnum.banker:
  }
}

import { eq, sql } from "drizzle-orm";

import drizzledb, { DatabaseType } from "../database/drizzle";
import { userPermissions, users } from "../database/schema";
import parseDiscordUID from "./userId";
import { User, DiscordUID, UserPermission } from "../../interfaces/database";

import { PermissionsEnum } from "../permissions/permissions";
import connectCollection from "../database/mongo";

interface UserWithPerms extends User {
  permissions: {
    id: PermissionsEnum;
    active: boolean;
    createdAt: number;
    updatedAt: number;
  }[];
}

/**
 * Get user discord uid.
 * @param {DiscordUID} id discord uid
 * @returns {User} User object
 */
export default async function getUser(id: DiscordUID): Promise<User> {
  parseDiscordUID(id);

  const coll = await connectCollection("users");
  
  const user = await coll.findOne({ _id: id }, { projection: { _id: 1, userName: 1, createdAt: 1, updatedAt: 1 } });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function checkUser(id: DiscordUID): Promise<boolean> {
  parseDiscordUID(id);

  const coll = await connectCollection("users");

  const user = await coll.findOne({ _id: id }, { projection: { _id: 1 } });

  return !!user;
}


// export async function getUserOld(id: DiscordUID): Promise<User> {
//   parseDiscordUID(id);

//   const db = drizzledb(DatabaseType.bonkDb);

//   const userResult = await db
//     .select()
//     .from(users)
//     .where(eq(users.id, id))
//     .limit(1);

//   if (userResult.length === 0) {
//     throw new Error("User not found");
//   }

//   return userResult[0];
// }

export async function getUserWithPermissions(
  id: DiscordUID
): Promise<UserWithPerms> {
  parseDiscordUID(id);

  const coll = await connectCollection("users");

  // const aggResult = await coll.aggregate([{
  //   $match: { _id: id }
  // },
  // {
  //   $project: {
  //     _id: 1,
  //     userName: 1,
  //     createdAt: 1,
  //     updatedAt: 1
  //   }
  // },
  // {
  //   $lookup: {
  //     from: "userPermissions",
  //     pipeline: [
  //       {
  //         $match: {
  //           _id: id
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 0,
  //           permissionId: 1,
  //           active: 1
  //         }
  //       }
  //     ]
  //   }
  // }]).toArray();

  // write the above using the aggregate functions
  const aggResult = await coll.aggregate([{
    $match: { _id: id }
  },
  {
    $project: {
      _id: 1,
      userName: 1,
      createdAt: 1,
      updatedAt: 1,
    }
  }]).addStage<UserPermission>({
    $lookup: {
      from: "userPermissions",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$userId", "$$userId"]
            }
          }
        },
        {
          $project: {
            _id: 0,
            permissionId: 1,
            active: 1
          }
        }
      ],
      as: "userPermissions"
    }
  })
  .addStage({ $unwind: "$userPermissions" }).toArray();

  if (aggResult.length === 0) {
    throw new Error("User not found");
  }

  const returnObj: UserWithPerms = {
    _id: aggResult[0]._id,
    userName: aggResult[0].userName,
    createdAt: aggResult[0].createdAt,
    updatedAt: aggResult[0].updatedAt,
    permissions: aggResult[0].userPermissions
  };

  return returnObj;
}

export async function checkUserPermission(
  userId: DiscordUID,
  permission: PermissionsEnum
): Promise<boolean> {
  await getUser(userId);

  const db = drizzledb(DatabaseType.bonkDb);

  let sQuery = buildPermissionQuery(userId, permission);

  const permResult = await db
    .select({
      id: userPermissions.id,
      userId: userPermissions.userId,
      permissionId: userPermissions.permissionId,
      active: userPermissions.active,
    })
    .from(userPermissions)
    .where(sQuery);

  return permResult.length > 0;
}

function buildPermissionQuery(userId: DiscordUID, perm: PermissionsEnum) {
  switch (perm) {
    case PermissionsEnum.basic:
      return sql`${userPermissions.userId} = ${userId} AND ${userPermissions.active} = 1 AND (${userPermissions.permissionId} = ${PermissionsEnum.admin} OR ${userPermissions.permissionId} = ${PermissionsEnum.banker} OR ${userPermissions.permissionId} = ${PermissionsEnum.basic} OR ${userPermissions.permissionId} = ${PermissionsEnum.bigHoncho})`;
    case PermissionsEnum.banker:
      return sql`${userPermissions.userId} = ${userId} AND ${userPermissions.active} = 1 AND (${userPermissions.permissionId} = ${PermissionsEnum.admin} OR ${userPermissions.permissionId} = ${PermissionsEnum.banker} OR ${userPermissions.permissionId} = ${PermissionsEnum.bigHoncho})`;
    case PermissionsEnum.admin:
      return sql`${userPermissions.userId} = ${userId} AND ${userPermissions.active} = 1 AND (${userPermissions.permissionId} = ${PermissionsEnum.admin} OR ${userPermissions.permissionId} = ${PermissionsEnum.bigHoncho})`;
    case PermissionsEnum.bigHoncho:
      return sql`${userPermissions.userId} = ${userId} AND ${userPermissions.active} = 1 AND ${userPermissions.permissionId} = ${PermissionsEnum.bigHoncho}`;
    default:
      throw new Error("Invalid permission");
  }
}

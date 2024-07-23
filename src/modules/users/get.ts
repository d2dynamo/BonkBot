import parseDiscordUID from "./userId";
import { User, DiscordUID, UserPerm } from "../../interfaces/database";

import { PermissionsEnum } from "../permissions/permissions";
import connectCollection, { stringToObjectId } from "../database/mongo";
import { ObjectId } from "mongodb";

interface UserWithPerms extends User {
  permissions: UserPerm[];
}

/**
 * Get user discord uid. Also validates userid.
 * @param {DiscordUID} id discord uid
 * @returns {User} User object
 */
export default async function getUser(id: DiscordUID): Promise<User> {
  parseDiscordUID(id);

  const coll = await connectCollection("users");

  const user = await coll.findOne(
    { _id: id },
    { projection: { _id: 1, userName: 1, createdAt: 1, updatedAt: 1 } }
  );

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

export async function getUserWithPermissions(
  id: DiscordUID
): Promise<UserWithPerms> {
  parseDiscordUID(id);

  const coll = await connectCollection("users");

  const aggResult = await coll
    .aggregate([
      {
        $match: { _id: id },
      },
      {
        $project: {
          _id: 1,
          userName: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $lookup: {
          from: "userPermissions",
          as: "userPermissions",
          pipeline: [
            {
              $match: {
                userId: id,
              },
            },
            {
              $project: {
                _id: 0,
                permissions: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$userPermissions",
      },
    ])
    .toArray();

  if (aggResult.length === 0) {
    throw new Error("User not found");
  }

  const returnObj: UserWithPerms = {
    _id: aggResult[0]._id,
    userName: aggResult[0].userName,
    createdAt: aggResult[0].createdAt,
    updatedAt: aggResult[0].updatedAt,
    permissions: aggResult[0].userPermissions.permissions,
  };

  return returnObj;
}

export async function checkUserPermission(
  userId: DiscordUID,
  permId: string | ObjectId
): Promise<boolean> {
  await getUser(userId);

  const coll = await connectCollection("userPermissions");

  const permOId = await stringToObjectId(permId);
  if (!permOId) {
    throw new Error(`Invalid objectId: ${permId}`);
  }

  const permResult = await coll.findOne(
    {
      permissions: {
        $elemMatch: { permissionId: { $eq: permOId }, active: { $eq: true } },
      },
    },
    {
      projection: {
        _id: 1,
      },
    }
  );

  return !!permResult?._id;
}

import parseDiscordUID from "./userId";
import { User, DiscordUID, UserPerm } from "../../interfaces/database";

import connectCollection, { stringToObjectId } from "../database/mongo";
import { ObjectId } from "mongodb";

interface UserWithPerms extends Omit<User, "discordId" | "guildId"> {
  _id: ObjectId;
  permissions: UserPerm[];
}

interface GetUserDUID extends Omit<User, "discordId" | "guildId"> {
  _id: ObjectId;
}

/**
 * Get user with discord uid.
 * @param {DiscordUID} id discord uid
 * @param {string} gid guild id
 * @returns {User} User object
 */
export async function getUserDUID(
  id: DiscordUID,
  gid: string
): Promise<GetUserDUID> {
  parseDiscordUID(id);

  const coll = await connectCollection("users");

  const user = await coll.findOne(
    { discordId: id, guildId: gid },
    {
      projection: {
        _id: 1,
        userName: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    }
  );

  if (!user || !user._id) {
    throw new Error("User not found");
  }

  return user;
}

/**
 * Check if user exists with discord uid.
 * @param {DiscordUID} id discord uid
 * @param {string} gid guild id
 * @returns {boolean} true if user exists
 */
export async function checkUserDUID(
  id: DiscordUID,
  gid: string
): Promise<boolean> {
  parseDiscordUID(id);

  const coll = await connectCollection("users");

  const user = await coll.findOne({ discordId: id, guildId: gid });

  return !!user;
}

/**
 * Get user with permissions.
 * @param {DiscordUID} id discord uid
 * @param {string} gid guild id
 * @returns {UserWithPerms} User object with permissions
 */
export async function getUserWithPermissionsDUID(
  id: DiscordUID,
  gid: string
): Promise<UserWithPerms> {
  parseDiscordUID(id);

  const coll = await connectCollection("users");

  const aggResult = await coll
    .aggregate([
      {
        $match: { discordId: id, guildId: gid },
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

export async function checkUserPermissionDUID(
  userId: DiscordUID,
  gid: string,
  permId: string | ObjectId
): Promise<boolean> {
  const user = await getUserDUID(userId, gid);

  const coll = await connectCollection("userPermissions");

  const permOId = await stringToObjectId(permId);
  if (!permOId) {
    throw new Error(`Invalid objectId: ${permId}`);
  }

  const permResult = await coll.findOne(
    {
      userId: user._id,
      permissions: {
        $elemMatch: {
          permissionId: { $eq: permOId },
          active: { $eq: true },
        },
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

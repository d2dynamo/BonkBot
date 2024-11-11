import parseDiscordUID from "./userId";
import { User, DiscordUID, UserPerm } from "../../interfaces/database";

import connectCollection, { stringToObjectId } from "../database/mongo";
import { ObjectId } from "mongodb";

interface UserWithPerms extends Omit<User, "discordId" | "guildDID"> {
  _id: ObjectId;
  permissions: UserPerm[];
}

interface GetUser extends Omit<User, "discordId" | "guildDID"> {
  _id: ObjectId;
}

/**
 * Get user with discord uid.
 * @param {DiscordUID} id discord uid
 * @param {string} gid guild id
 * @returns {User} User object
 */
export async function getUser(id: DiscordUID, gid: string): Promise<GetUser> {
  parseDiscordUID(id);

  const coll = await connectCollection("users");

  const user = await coll.findOne(
    { discordId: id, guildDID: gid },
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
export async function checkUser(id: DiscordUID, gid: string): Promise<boolean> {
  parseDiscordUID(id);

  const coll = await connectCollection("users");

  const user = await coll.findOne({ discordId: id, guildDID: gid });

  return !!user;
}

/**
 * Get user with permissions.
 * @param {DiscordUID} id discord uid
 * @param {string} gid guild id
 * @returns {UserWithPerms} User object with permissions
 */
export async function getUserWithPermissions(
  id: DiscordUID,
  gid: DiscordUID
): Promise<UserWithPerms> {
  parseDiscordUID(id);

  const coll = await connectCollection("users");

  const aggResult = await coll
    .aggregate([
      {
        $match: { discordId: id, guildDID: gid },
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
  userDID: DiscordUID,
  guildDID: string,
  permId: string | ObjectId
): Promise<boolean> {
  const user = await getUser(userDID, guildDID);

  const coll = await connectCollection("userPermissions");

  const permOId = await stringToObjectId(permId);
  if (!permOId) {
    throw new Error(`Invalid permission objectId: ${permId}`);
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

/**
 * Get user with object id.
 * @param {ObjectId} id bson id
 */
export async function getUserWOID(id: ObjectId): Promise<User> {
  const coll = await connectCollection("users");

  const user = await coll.findOne(
    { _id: id },
    {
      projection: {
        _id: 0,
        discordId: 1,
        guildDID: 1,
        userName: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

/**
 * Check if user exists with object id.
 * @param {ObjectId} id bson id
 */
export async function checkUserWOID(id: ObjectId): Promise<boolean> {
  const coll = await connectCollection("users");

  const user = await coll.findOne({ _id: id });

  return !!user;
}

interface UserWithPermsWOID extends User {
  permissions: UserPerm[];
}

/**
 * Get user with permissions with object id.
 * @param {ObjectId} id bson id
 */
export async function getUserWithPermissionsWOID(
  id: ObjectId
): Promise<UserWithPermsWOID> {
  const coll = await connectCollection("users");

  const aggResult = await coll
    .aggregate([
      {
        $match: { _id: id },
      },
      {
        $project: {
          _id: 0,
          discordId: 1,
          guildDID: 1,
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

  const returnObj: UserWithPermsWOID = {
    discordId: aggResult[0].discordId,
    guildDID: aggResult[0].guildDID,
    userName: aggResult[0].userName,
    createdAt: aggResult[0].createdAt,
    updatedAt: aggResult[0].updatedAt,
    permissions: aggResult[0].userPermissions.permissions,
  };

  return returnObj;
}

/**
 * Check if user has permission with object id.
 * @param {ObjectId} userId bson id
 * @param {string | ObjectId} permId permission id
 */
export async function checkUserPermissionWOID(
  userId: ObjectId,
  permId: string | ObjectId
) {
  const coll = await connectCollection("userPermissions");

  const permOId = await stringToObjectId(permId);
  if (!permOId) {
    throw new Error(`Invalid permission objectId: ${permId}`);
  }

  const permResult = await coll.findOne(
    {
      userId: userId,
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

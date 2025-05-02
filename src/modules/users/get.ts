import parseDiscordUID from '../discordUID';
import { User, DiscordUID, UserPerm } from '../../interfaces/database';

import connectCollection, {
  stringToObjectId,
  stringToObjectIdSyncForce,
} from '../database/mongo';
import { ObjectId } from 'mongodb';
import { PermissionsEnum } from '../permissions/permissions';

interface UserWithPerms extends Omit<User, 'discordId' | 'guildDID'> {
  _id: ObjectId;
  permissions: UserPerm[];
}

interface GetUser extends Omit<User, 'discordId' | 'guildDID'> {
  _id: ObjectId;
}

/**
 * Get user with discord uid.
 * @param {DiscordUID} id user discord uid
 * @param {DiscordUID} gid guild discord id
 * @returns {GetUser} User object
 */
export async function getUser(
  id: DiscordUID,
  gid: DiscordUID
): Promise<GetUser> {
  parseDiscordUID(id);

  const coll = await connectCollection('users');

  const user = await coll.findOne(
    { discordId: id, guildDID: gid },
    {
      projection: {
        _id: 1,
        userName: 1,
        displayName: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    }
  );

  if (!user || !user._id) {
    throw new Error(`User not found: ${id}|${gid}`);
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

  const coll = await connectCollection('users');

  const user = await coll.findOne({ discordId: id, guildDID: gid });

  return !!user;
}

/**
 * Get user with permissions.
 * @param {DiscordUID} id discord uid
 * @param {string} gid guild discord id
 * @returns {UserWithPerms} User object with permissions
 */
export async function getUserWithPermissions(
  id: DiscordUID,
  gid: DiscordUID
): Promise<UserWithPerms> {
  parseDiscordUID(id);

  const coll = await connectCollection('users');

  const aggResult = await coll
    .aggregate([
      {
        $match: { discordId: id, guildDID: gid },
      },
      {
        $project: {
          _id: 1,
          guildId: 1,
          userName: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $lookup: {
          from: 'userPermissions',
          as: 'userPermissions',
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
        $unwind: '$userPermissions',
      },
    ])
    .toArray();

  if (aggResult.length === 0) {
    throw new Error('User not found');
  }

  const returnObj: UserWithPerms = {
    _id: aggResult[0]._id,
    guildId: aggResult[0].guildId,
    userName: aggResult[0].userName,
    createdAt: aggResult[0].createdAt,
    updatedAt: aggResult[0].updatedAt,
    permissions: aggResult[0].userPermissions.permissions,
  };

  return returnObj;
}

/**
 * Array of permissions that the given permission id has priority over.
 * @param permId permission id from PermissionsEnum
 */
const getPermissionTree = (permId: string | ObjectId): Array<ObjectId> => {
  const basic = PermissionsEnum.basic;
  const banker = PermissionsEnum.banker;
  const admin = PermissionsEnum.admin;
  const bigHoncho = PermissionsEnum.bigHoncho;

  switch (String(permId)) {
    case basic:
      return [
        stringToObjectIdSyncForce(basic),
        stringToObjectIdSyncForce(banker),
        stringToObjectIdSyncForce(admin),
        stringToObjectIdSyncForce(bigHoncho),
      ];
    case banker:
      return [
        stringToObjectIdSyncForce(banker),
        stringToObjectIdSyncForce(admin),
        stringToObjectIdSyncForce(bigHoncho),
      ];
    case admin:
      return [
        stringToObjectIdSyncForce(admin),
        stringToObjectIdSyncForce(bigHoncho),
      ];
    case bigHoncho:
      return [stringToObjectIdSyncForce(bigHoncho)];

    default:
      return [];
  }
};

/**
 * Checks if user has the specified or higher level of permission.
 * @param {DiscordUID} userDID discord uid
 * @param {string} guildDID guild id
 * @param {string | ObjectId} permId permission id
 * @returns {boolean} true if user has permission
 */
export async function checkUserPermission(
  userDID: DiscordUID,
  guildDID: string,
  permId: string | ObjectId
): Promise<boolean> {
  const user = await getUser(userDID, guildDID);

  const coll = await connectCollection('userPermissions');

  const permTree = getPermissionTree(permId);
  if (!permTree.length) {
    throw new Error(`Invalid permission: ${permId}`);
  }

  const permResult = await coll.findOne(
    {
      userId: user._id,
      permissions: {
        $elemMatch: {
          permissionId: { $in: permTree },
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
  const coll = await connectCollection('users');

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
    throw new Error('User not found');
  }

  return user;
}

/**
 * Check if user exists with object id.
 * @param {ObjectId} id bson id
 */
export async function checkUserWOID(id: ObjectId): Promise<boolean> {
  const coll = await connectCollection('users');

  const user = await coll.findOne({ _id: id });

  return !!user;
}

interface UserWithPermsWOID extends Omit<User, 'guildId'> {
  permissions: UserPerm[];
}

/**
 * Get user with permissions with object id.
 * @param {ObjectId} id bson id
 */
export async function getUserWithPermissionsWOID(
  id: ObjectId
): Promise<UserWithPermsWOID> {
  const coll = await connectCollection('users');

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
          from: 'userPermissions',
          as: 'userPermissions',
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
        $unwind: '$userPermissions',
      },
    ])
    .toArray();

  if (aggResult.length === 0) {
    throw new Error('User not found');
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
  const coll = await connectCollection('userPermissions');

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

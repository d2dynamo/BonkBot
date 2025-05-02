import { ObjectId } from 'mongodb';

import connectCollection from '../database/mongo';
import { getGuild } from '../guild/get';
import { pipeline } from 'stream';
import path from 'path';

interface ListDebtFilter {
  guildDID: string;
}

interface DebtListEntry {
  userDID: string;
  userName: string;
  balance: number;
}

export async function listDebts(
  filter: ListDebtFilter
): Promise<DebtListEntry[]> {
  if (!getGuild(filter.guildDID)) {
    throw new Error(`Guild not found: ${filter.guildDID}`);
  }

  const coll = await connectCollection('users');

  if (!coll) {
    throw new Error('Could not connect to users collection');
  }

  const cursor = coll.aggregate([
    {
      $match: {
        guildDID: filter.guildDID,
      },
    },
    {
      $project: { _id: 1, userDID: '$discordId', userName: 1, displayName: 1 },
    },
    {
      $lookup: {
        from: 'bonkWallets',
        let: { userObjId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$userId', '$$userObjId'],
              },
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
        ],
        as: 'wallet',
      },
    },
    {
      $unwind: '$wallet',
    },
    {
      $lookup: {
        from: 'bonkWalletTransactions',
        let: { walletObjId: '$wallet._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$walletId', '$$walletObjId'],
              },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              _id: 0,
              balance: 1,
              createdAt: 1,
            },
          },
        ],
        as: 'lastTransaction',
      },
    },
    {
      $unwind: {
        path: '$lastTransaction',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        userDID: '$discordId',
        userName: 1,
        displayName: 1,
        balance: {
          $ifNull: ['$lastTransaction.balance', 0],
        },
      },
    },
  ]);

  const entries: DebtListEntry[] = [];

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (!doc) continue;

    const entry: DebtListEntry = {
      userDID: doc.userDID || 'unknown',
      userName: doc.displayName || doc.userName || 'unknown',
      balance: doc.balance || 0,
    };

    entries.push(entry);
  }

  return entries;
}

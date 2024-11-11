import { DiscordUID } from "../../interfaces/database";
import { getUser } from "../users/get";
import connectCollection from "../database/mongo";
import { ObjectId } from "mongodb";

/**
 *
 * @param userDID user discord id
 * @param guildDID user's guild id
 * @returns boolean indicating success
 */
export async function createWallet(
  userDID: DiscordUID,
  guildDID: string
): Promise<boolean> {
  const user = await getUser(userDID, guildDID);

  const coll = await connectCollection("bonkWallets");

  const result = await coll.updateOne(
    {
      userId: user._id,
    },
    {
      $setOnInsert: {
        createdAt: new Date(),
        userId: user._id,
      },
      $set: {
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  if (!result.modifiedCount && !result.upsertedCount) {
    throw new Error(
      `Failed to create new wallet for user: ${userDID}|${guildDID}`
    );
  }

  return true;
}

/**
 * Create a wallet with user's bson id.
 * @param userId user bson id
 * @returns boolean indicating success
 */
export async function createWalletWOID(userId: ObjectId): Promise<boolean> {
  const coll = await connectCollection("bonkWallets");

  const result = await coll.updateOne(
    {
      userId: userId,
    },
    {
      $setOnInsert: {
        createdAt: new Date(),
        userId: userId,
      },
      $set: {
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  if (!result.modifiedCount && !result.upsertedCount) {
    throw new Error(`Failed to create new wallet for user: ${userId}`);
  }

  return true;
}

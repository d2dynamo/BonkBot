import { DiscordUID } from "../../interfaces/database";
import getUser from "../users/get";
import connectCollection from "../database/mongo";

export default async function createWallet(
  userId: DiscordUID
): Promise<boolean> {
  await getUser(userId);

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
    }
  );

  if (!result.modifiedCount && !result.upsertedCount) {
    throw new Error(`Failed to create new wallet for user: ${userId}`);
  }

  return true;
}

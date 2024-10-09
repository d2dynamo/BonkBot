import { DiscordUID } from "../../interfaces/database";
import connectCollection, { stringToObjectId } from "../database/mongo";
import { ObjectId } from "mongodb";
import getUser from "../users/get";

export default async function updateWallet(
  walletId: string | ObjectId,
  change: number,
  instigatorId: DiscordUID
) {
  const coll = await connectCollection("bonkWalletTransactions");

  const walletObjId = await stringToObjectId(walletId);
  if (!walletObjId) {
    throw new Error(`invalid walletId: ${walletId}`);
  }

  const latestTx = await coll.findOne(
    { walletId: walletObjId },
    { sort: { createdAt: -1 } }
  );

  let newBal = change;

  if (latestTx && latestTx.balance) {
    newBal = latestTx.balance += change;
  }

  const insertResult = await coll.insertOne({
    walletId: walletObjId,
    change: change,
    balance: newBal,
    createdAt: new Date(),
    updatedAt: new Date(),
    creatorUserId: instigatorId,
  });

  if (!insertResult.insertedId) {
    throw new Error(
      `failed to insert new wallet transaction. Instigator: ${instigatorId} | walletId: ${walletId}`
    );
  }

  return true;
}

export async function updateUserWallet(
  userId: DiscordUID,
  change: number,
  instigatorId: DiscordUID
) {
  await getUser(userId);
  const coll = await connectCollection("bonkWallets");

  const wallet = await coll.findOne({ userId: userId });

  if (!wallet || !wallet._id) {
    throw new Error("User wallet not found");
  }

  const txColl = await connectCollection("bonkWalletTransactions");

  const latestTx = await txColl.findOne(
    { walletId: wallet._id },
    { sort: { createdAt: -1 } }
  );

  let newBal = change;

  if (latestTx && latestTx.balance) {
    newBal = latestTx.balance += change;
  }

  const insertResult = await txColl.insertOne({
    walletId: wallet._id,
    change: change,
    balance: newBal,
    createdAt: new Date(),
    updatedAt: new Date(),
    creatorUserId: instigatorId,
  });

  if (!insertResult.insertedId) {
    throw new Error(
      `failed to insert new wallet transaction. Instigator: ${instigatorId} | userId: ${userId}`
    );
  }

  return true;
}

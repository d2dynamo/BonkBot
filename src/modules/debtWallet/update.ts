import { DiscordUID } from "../../interfaces/database";
import connectCollection, { stringToObjectId } from "../database/mongo";
import { ObjectId } from "mongodb";
import { getUser } from "../users/get";

export async function updateWallet(
  walletId: string | ObjectId,
  instigatorIdDID: DiscordUID,
  guildDID: string,
  change: number,
  note?: string
) {
  const instigator = await getUser(instigatorIdDID, guildDID);

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
    creatorUserId: instigator._id,
    note: note,
    createdAt: new Date(),
  });

  if (!insertResult.insertedId) {
    throw new Error(
      `failed to insert new wallet transaction. Instigator: ${instigator._id} | walletId: ${walletId}`
    );
  }

  return true;
}

export async function updateUserWallet(
  userDID: DiscordUID,
  guildDID: string,
  instigatorId: DiscordUID,
  change: number,
  note?: string
) {
  const user = await getUser(userDID, guildDID);
  const instigator = await getUser(instigatorId, guildDID);

  const coll = await connectCollection("bonkWallets");

  const wallet = await coll.findOne({ userId: user._id });

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
    creatorUserId: instigator._id,
    note: note,
    createdAt: new Date(),
  });

  if (!insertResult.insertedId) {
    throw new Error(
      `failed to insert new wallet transaction. Instigator: ${instigator._id} | userId: ${user._id}`
    );
  }

  return true;
}

export async function updateUserWalletWOID(
  userId: ObjectId,
  instigatorId: ObjectId,
  change: number,
  note?: string
) {
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
    creatorUserId: instigatorId,
    note: note,
    createdAt: new Date(),
  });

  if (!insertResult.insertedId) {
    throw new Error(
      `failed to insert new wallet transaction. Instigator: ${instigatorId} | userId: ${userId}`
    );
  }

  return true;
}

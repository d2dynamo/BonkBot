import { DiscordUID } from "../../interfaces/database";
import connectCollection, { stringToObjectId } from "../database/mongo";
import { UserError } from "../errors";
import { Document, ObjectId } from "mongodb";

// /**
//  * Update wallet.
//  * @param walletId wallet id
//  * @param balance new balance.
//  */
// export async function updateWallet(
//   walletId: number,
//   balance: number,
//   creatorUserId: DiscordUID
// ) {
//   const db = drizzledb(DatabaseType.bonkDb);
//   await db.transaction(async (tx) => {
//     const walletResult = await tx
//       .select()
//       .from(bonkWallets)
//       .where(eq(bonkWallets.id, walletId))
//       .limit(1);

//     if (walletResult.length === 0) {
//       throw new UserError("Wallet does not exist.");
//     }

//     const wallet = walletResult[0];

//     const createTransactionResult = await tx
//       .insert(bonkWalletTransactions)
//       .values({
//         walletId: walletId,
//         creatorUserId: creatorUserId,
//         balance: balance,
//       });

//     if (createTransactionResult.changes === 0) {
//       throw new Error("Failed to create transaction.");
//     }

//     await tx
//       .update(bonkWallets)
//       .set({ updatedAt: Date.now() })
//       .where(eq(bonkWallets.id, walletId));
//   });

//   return true;
// }

// /**
//  * Update user wallet.
//  * @param userId discord uid
//  * @param balance new balance.
//  */
// export default async function updateUserWallet(
//   userId: DiscordUID,
//   balance: number,
//   creatorUserId: DiscordUID
// ) {
//   const db = drizzledb(DatabaseType.bonkDb);

//   await db.transaction(async (trx) => {
//     const walletResult = await trx
//       .select()
//       .from(bonkWallets)
//       .where(eq(bonkWallets.userId, userId))
//       .limit(1);

//     if (walletResult.length === 0) {
//       throw new UserError("Wallet not found");
//     }

//     const wallet = walletResult[0];

//     const createTransactionResult = await trx
//       .insert(bonkWalletTransactions)
//       .values({
//         walletId: wallet.id,
//         creatorUserId: creatorUserId,
//         balance: balance,
//       });

//     if (createTransactionResult.changes === 0) {
//       throw new Error("Failed to create transaction.");
//     }

//     await trx
//       .update(bonkWallets)
//       .set({ updatedAt: Date.now() })
//       .where(eq(bonkWallets.id, wallet.id));
//   });
// }

export async function updateWallet(
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

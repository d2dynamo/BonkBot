import { ObjectId } from "mongodb";
import { BonkWalletTransaction } from "../../interfaces/database";
import connectCollection, { stringToObjectId } from "../database/mongo";

/** Calculates latest balance based on given transactions.
 *
 * @param transactions array of transactions sorted by createdAt, first item is latest transaction.
 */
export const latestBalance = (
  transactions: BonkWalletTransaction[]
): number => {
  const latestTx = transactions[0];
  const latestBal = latestTx.balance;

  // if theres only two or less transaction records then there is nothing to calculate.
  if (transactions.length - 1 < 2) {
    return latestBal;
  }

  let calcBal = transactions[transactions.length - 1].balance;

  for (let i = transactions.length - 2; i >= 0; i--) {
    const tx = transactions[i];
    calcBal += tx.change;
  }

  if (calcBal != latestBal) {
    console.log(
      `wallet ${latestTx.walletId} mismatching balance. Latest balance: ${latestBal} _id ${latestTx._id} | calculated ${calcBal} from ${transactions.length} latest transactions.`
    );
  }

  return calcBal;
};

/** Get latest transactions for specified walletId.
 * First item in array will be the latest transaction.
 * @param walletId {ObjectId} wallet id
 * @param limit how many transactions to return
 */
export default async function getWalletTransactions(
  walletId: string | ObjectId,
  limit = 5
): Promise<BonkWalletTransaction[]> {
  const walletObjId = await stringToObjectId(walletId);

  if (!walletObjId) {
    throw new Error(`invalid walletId ${walletId}`);
  }

  const coll = await connectCollection("bonkWalletTransactions");

  const cursor = coll.find(
    { walletId: walletObjId },
    { batchSize: 2000, limit: limit, sort: { createdAt: -1 } }
  );

  const transactions: BonkWalletTransaction[] = [];

  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    if (!doc || !doc._id || !doc.walletId) {
      console.log(`Invalid transaction. Missing _id or walletId: ${doc}`);
      continue;
    }

    if (
      !doc.change ||
      isNaN(doc.change) ||
      !doc.balance ||
      isNaN(doc.balance)
    ) {
      console.log(
        `Invalid transaction found. Bad 'change' or 'balance': doc ${doc._id} | change ${doc.change} | balance ${doc.balance}`
      );
      continue;
    }

    transactions.push({
      _id: doc._id,
      walletId: doc.walletId,
      balance: doc.balance,
      change: doc.change,
      creatorUserId: doc.creatorUserId,
      createdAt: doc.createdAt,
      note: doc.note,
    });
  }

  return transactions;
}

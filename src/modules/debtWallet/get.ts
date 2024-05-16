import { desc, eq } from "drizzle-orm";

import drizzledb, { DatabaseType } from "../database/drizzle";
import { bonkWallets, bonkWalletTransactions } from "../database/schema";
import { UserId } from "../../interfaces/database";
import { UserError } from "../errors";
import { DebtWallet } from "./debtWallet";
import parseUserId from "../users/userId";

/**
 * Get wallet for user.
 * @param id - Discord UID.
 * @returns A promise that resolves to a BonkDebtWallet object.
 */
export default async function getUserWallet(id: UserId): Promise<DebtWallet> {
  parseUserId(id);
  const db = drizzledb(DatabaseType.bonkDb);

  const userWallet = await db.transaction(async (trx) => {
    const walletResult = await trx
      .select()
      .from(bonkWallets)
      .where(eq(bonkWallets.userId, id))
      .limit(1);

    if (walletResult.length === 0) {
      throw new UserError("Wallet not found");
    }

    const wallet = walletResult[0];

    const latestTransaction = await trx
      .select()
      .from(bonkWalletTransactions)
      .where(eq(bonkWalletTransactions.walletId, wallet.id))
      .orderBy(desc(bonkWalletTransactions.createdAt))
      .limit(1);

    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: latestTransaction.length > 0 ? latestTransaction[0].balance : 0,
      lastTransactionId:
        latestTransaction.length > 0 ? latestTransaction[0].id : 0,
      lastTransactionCreatedAt:
        latestTransaction.length > 0 ? latestTransaction[0].createdAt : 0,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  });

  return userWallet;
}

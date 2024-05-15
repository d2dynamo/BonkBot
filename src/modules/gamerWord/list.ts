import { eq, sql } from "drizzle-orm";

import drizzledb, { DatabaseType } from "../database/drizzle";
import { gamerWords, gamerWordPhrases } from "../database/schema";
import { UserId } from "../../interfaces/database";
import { UserError } from "../errors";
import GamerWord from "./gamerWord";

// TODO: CACHING FOR THIS SH**. This will be called on every f***ing message in discord.

// export default async function getUserWallet(id: UserId): Promise<DebtWallet> {
//   parseUserId(id);
//   const db = drizzledb(DatabaseType.bonkDb);

//   const userWallet = await db.transaction(async (trx) => {
//     const walletResult = await trx
//       .select()
//       .from(bonkWallets)
//       .where(eq(bonkWallets.userId, id))
//       .limit(1);

//     if (walletResult.length === 0) {
//       throw new UserError("User does not exist.");
//     }

//     const wallet = walletResult[0];

//     // Get the latest transaction for the wallet
//     const latestTransaction = await trx
//       .select()
//       .from(bonkWalletTransactions)
//       .where(eq(bonkWalletTransactions.walletId, wallet.id))
//       .orderBy(desc(bonkWalletTransactions.createdAt))
//       .limit(1);

//     return {
//       id: wallet.id,
//       userId: wallet.userId,
//       balance: latestTransaction.length > 0 ? latestTransaction[0].balance : 0,
//       lastTransactionId:
//         latestTransaction.length > 0 ? latestTransaction[0].id : 0,
//       lastTransactionCreatedAt:
//         latestTransaction.length > 0 ? latestTransaction[0].createdAt : 0,
//       createdAt: wallet.createdAt,
//       updatedAt: wallet.updatedAt,
//     };
//   });

//   return userWallet;
// }

/**
 * Get all GameWords.
 * @returns GamerWord array
 */
export default async function listAndBuildGamerWords(): Promise<GamerWord[]> {
  const db = drizzledb(DatabaseType.bonkDb);

  const gamerWordsArray = await db.transaction(async (tx) => {
    const gamerWordsResult = await tx
      .select({
        id: gamerWords.id,
        word: gamerWords.word,
        cost: gamerWords.cost,
        response: gamerWords.response,
        createdAt: gamerWords.createdAt,
        updatedAt: gamerWords.updatedAt,
        phrases: sql`(
        SELECT json_group_array(gwp.phrase)
        FROM ${gamerWordPhrases} gwp
        WHERE gwp.gamerWordId = ${gamerWords.id}
      )`.as("phrases"),
      })
      .from(gamerWords);

    if (gamerWordsResult.length === 0) {
      throw new Error("No gamer words found");
    }

    const gamerWordList: GamerWord[] = [];

    for (let i = 0; i < gamerWordsResult.length; i++) {
      const phrases = JSON.parse(
        gamerWordsResult[i].phrases as string
      ) as string[];

      const gamerWord = new GamerWord(phrases, gamerWordsResult[i].cost, {
        response: gamerWordsResult[i].response || undefined,
      });

      gamerWordList.push(gamerWord);
    }

    return gamerWordList;
  });

  return gamerWordsArray;
}

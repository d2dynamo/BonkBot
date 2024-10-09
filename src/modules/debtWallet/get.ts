import { DiscordUID } from "../../interfaces/database";
import { DebtWallet } from "./types";
import connectCollection from "../database/mongo";
import getUser from "../users/get";
import getWalletTransactions from "./transactions";

export default async function getUserWallet(
  userId: DiscordUID
): Promise<DebtWallet> {
  await getUser(userId);

  const coll = await connectCollection("bonkWallets");

  const walletDoc = await coll.findOne({ userId: userId });

  if (!walletDoc || !walletDoc._id) {
    throw new Error(`Wallet not found for user: ${userId}`);
  }

  const transactions = await getWalletTransactions(walletDoc._id);

  let latestBal = transactions.length > 0 ? transactions[0].balance : 0;

  const debtWallet: DebtWallet = {
    id: walletDoc._id,
    userId: userId,
    balance: latestBal,
    lastTransactionId: transactions[0]?._id || null,
    lastTransactionCreatedAt: transactions[0]?.createdAt || null,
    createdAt: walletDoc.createdAt,
    updatedAt: walletDoc.updatedAt,
  };

  return debtWallet;
}

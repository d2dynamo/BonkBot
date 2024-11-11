import { DiscordUID } from "../../interfaces/database";
import { DebtWallet } from "./types";
import connectCollection from "../database/mongo";
import { getUser } from "../users/get";
import getWalletTransactions from "./transactions";

export async function getUserWallet(
  userDID: DiscordUID,
  guildDID: string
): Promise<DebtWallet> {
  const user = await getUser(userDID, guildDID);
  if (!user) {
    throw new Error(`User not found: ${userDID}|${guildDID}`);
  }

  const coll = await connectCollection("bonkWallets");

  const walletDoc = await coll.findOne({ userId: user._id });

  if (!walletDoc || !walletDoc._id) {
    throw new Error(`Wallet not found for user: ${userDID}|${guildDID}`);
  }

  const transactions = await getWalletTransactions(walletDoc._id);

  let latestBal = transactions.length > 0 ? transactions[0].balance : 0;

  const debtWallet: DebtWallet = {
    id: walletDoc._id,
    userId: user._id,
    balance: latestBal,
    lastTransactionId: transactions[0]?.id || null,
    lastTransactionCreatedAt: transactions[0]?.createdAt || null,
    createdAt: walletDoc.createdAt,
    updatedAt: walletDoc.updatedAt,
  };

  return debtWallet;
}

import { ObjectId } from "mongodb";
import { DiscordUID } from "../../interfaces/database";

export interface DebtWallet {
  id: ObjectId;
  userId: ObjectId;
  balance: number;
  lastTransactionId: ObjectId | null;
  lastTransactionCreatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DebtWalletTransaction {
  id: ObjectId;
  walletId: ObjectId;
  balance: number;
  change: number;
  creatorUserId: ObjectId;
  createdAt: Date;
  note?: string;
}

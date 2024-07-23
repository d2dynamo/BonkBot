import { ObjectId } from "mongodb";
import { DiscordUID } from "../../interfaces/database";

export interface DebtWallet {
  id: ObjectId;
  userId: DiscordUID;
  balance: number;
  lastTransactionId: ObjectId;
  lastTransactionCreatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

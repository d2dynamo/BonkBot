import { DiscordUID } from "../../interfaces/database";

export interface DebtWallet {
  id: number;
  userId: DiscordUID;
  balance: number;
  lastTransactionId: number;
  lastTransactionCreatedAt: number;
  createdAt: number;
  updatedAt: number;
}

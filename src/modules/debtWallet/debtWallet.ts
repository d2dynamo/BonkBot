import { UserId } from "../../interfaces/database";

export interface DebtWallet {
  id: number;
  userId: UserId;
  balance: number;
  lastTransactionId: number;
  lastTransactionCreatedAt: number;
  createdAt: number;
  updatedAt: number;
}

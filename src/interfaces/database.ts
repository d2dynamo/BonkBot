/* NOTE: in database the naming is underscore case. So updatedAt is updated_at and so on */

export type UserId = number;

export interface BonkDebtWallet {
  id: string;
  userId: string;
  balance: number;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: UserId; //discord user id
  createdAt: number;
  updatedAt: number;
}

export interface GamerWord {
  id: string;
  phrases: string; //multi-word phrases separated with comma. Ex: 'lorem ipsum, dolor, sit amet,...'
  response?: string;
  cost?: number;
  createdAt: number;
  updatedAt: number;
}

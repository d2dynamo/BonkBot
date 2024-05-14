/* NOTE: in database the naming is underscore case. So updatedAt is updated_at and so on */

export type UserId = string;

export interface BonkDebtWallet {
  id: string;
  userId: UserId;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: UserId; //discord uid
  createdAt: Date;
  updatedAt: Date;
}

export interface GamerWord {
  id: string;
  word: string;
  cost?: number;
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GamerWordPhrases {
  id: string;
  wordId: string;
  phrase: string;
  createdAt: Date;
  updatedAt: Date;
}

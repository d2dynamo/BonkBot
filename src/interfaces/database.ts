export type UserId = string;

export interface User {
  id: UserId; //discord uid
  createdAt: number;
  updatedAt: number;
}

export interface BonkWallet {
  id: number;
  userId: UserId;
  createdAt: number;
  updatedAt: number;
}

export interface BonkWalletTransaction {
  id: number;
  walletId: number;
  balance: number;
  creatorUserId: UserId;
  createdAt: number;
}

export interface GamerWord {
  id: number;
  word: string;
  cost?: number;
  response?: string;
  createdAt: number;
  updatedAt: number;
}

export interface GamerWordPhrases {
  id: number;
  wordId: number;
  phrase: string;
  createdAt: number;
  updatedAt: number;
}

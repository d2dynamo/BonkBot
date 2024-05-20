export type UserId = string;

export interface User {
  id: UserId; //discord uid
  userName: string | null;
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

export interface GamerWordPhrase {
  id: number;
  wordId: number;
  phrase: string;
  createdAt: number;
  updatedAt: number;
}

export interface Permission {
  id: number;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserPermission {
  id: number;
  userId: UserId;
  permissionId: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

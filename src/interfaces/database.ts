import { ObjectId } from "mongodb";

/** DiscordUID is a bigint/long number stored as string. */
export type DiscordUID = string;

/** Collection document standard defs */
export type CollectionDocs = {
  users: User;
  bonkWallets: BonkWallet;
  bonkWalletTransactions: BonkWalletTransaction;
  gamerWords: GamerWord;
  permissions: Permission;
  userPermissions: UserPermission;
};

/** Available collections in bonkbot database */
export type BonkCollections = keyof CollectionDocs;

/** All mongodb collection doc defs should extend this with few exceptions. */
interface DefaultDocument {
  createdAt?: Date;
  updatedAt?: Date;
}

/** User document. This is the only document that has a non-objectId _id
 * @property {DiscordUID} _id - Discord UID (long number) as string.
 */
export interface User {
  userName?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Only embeded doc in UserPermission. UserPermissions.permissions */
export interface UserPerm {
  permissionId: ObjectId;
  active: boolean;
  updatedAt: Date;
}

export interface UserPermission extends DefaultDocument {
  userId: DiscordUID;
  permissions: UserPerm[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BonkWallet extends DefaultDocument {
  userId: DiscordUID;
  createdAt: Date;
  updatedAt: Date;
}

export interface BonkWalletTransaction extends DefaultDocument {
  walletId: ObjectId;
  change: number; // How much did this transaction change the wallet's current balance
  balance: number; // Balance after this transaction
  creatorUserId: DiscordUID;
  createdAt: Date;
  note?: string;
}

export interface GamerWord extends DefaultDocument {
  word: string;
  cost?: number;
  response?: string;
  phrases: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission extends DefaultDocument {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

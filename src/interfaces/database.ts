import { Document, ObjectId } from "mongodb";

/** DiscordUID is a bigint/long number stored as string. */
export type DiscordUID = string;

/** Available collections in bonkbot database */
export type bonkCollections =
  | "users"
  | "bonkWallets"
  | "bonkWalletTransactions"
  | "gamerWords"
  | "permissions"
  | "userPermissions";

// an enum or an object to bind the collection name to the related interface?

export interface User extends Document {
  _id: DiscordUID; // Discord UID as string
  userName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BonkWallet {
  _id: ObjectId;
  userId: DiscordUID; // Discord UID as string
  createdAt: Date;
  updatedAt: Date;
}

export interface BonkWalletTransaction {
  _id: ObjectId;
  walletId: ObjectId;
  change: number;
  balance: number;
  creatorUserId: DiscordUID; // Discord UID as string
  createdAt: Date;
  updatedAt: Date;
}

export interface GamerWord {
  _id: ObjectId;
  word: string;
  cost?: number;
  response?: string;
  phrases: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  _id: ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermission {
  permissionId: ObjectId;
  active: boolean;
  updatedAt: Date;
}

export interface UserPermissions {
  _id: DiscordUID; // Discord UID as string
  permissions: UserPermission[];
  createdAt: Date;
  updatedAt: Date;
}

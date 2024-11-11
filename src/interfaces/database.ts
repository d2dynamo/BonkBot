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
  gamerWordCollections: GamerWordCollection;
  guilds: Guild;
};

/** Available collections in bonkbot database */
export type BonkCollections = keyof CollectionDocs;

/** All mongodb collection doc defs should extend this with few exceptions. */
interface DefaultDocument {
  createdAt: Date;
  updatedAt: Date;
}

/** User document.
 * @property {DiscordUID} discordId - Discord UID (long number) as string.
 */
export interface User extends DefaultDocument {
  discordId: DiscordUID;
  guildId: string;
  userName?: string;
}

/** Only embeded doc in UserPermission. UserPermissions.permissions */
export interface UserPerm {
  permissionId: ObjectId;
  active: boolean;
}

export interface UserPermission extends DefaultDocument {
  userId: ObjectId;
  permissions: UserPerm[];
}

export interface BonkWallet extends DefaultDocument {
  userId: ObjectId;
}

export interface BonkWalletTransaction {
  walletId: ObjectId;
  change: number; // How much did this transaction change the wallet's current balance
  balance: number; // Balance after this transaction
  creatorUserId: ObjectId;
  createdAt: Date;
  note?: string;
}

export interface GamerWord extends DefaultDocument {
  collectionId: ObjectId;
  word: string;
  cost?: number;
  response?: string;
  phrases: string[];
}

export interface Permission extends DefaultDocument {
  name: string;
}

export interface GuildGamerWords extends DefaultDocument {
  guildId: ObjectId;
  gamerWordIds: number[];
}

export interface GamerWordCollection extends DefaultDocument {
  name: string;
}

export interface Guild extends DefaultDocument {
  discordId: string;
  name: string;
}

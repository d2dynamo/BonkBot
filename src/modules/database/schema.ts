import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const users = sqliteTable("users", {
  id: text("id").primaryKey(), // discord user uid
  userName: text("userName"),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`strftime('%s','now')`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`strftime('%s','now')`),
});

const bonkWallets = sqliteTable("bonkWallets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`strftime('%s','now')`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`strftime('%s','now')`),
});

const bonkWalletTransactions = sqliteTable(
  "bonkWalletTransactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    walletId: integer("walletId").references(() => bonkWallets.id),
    balance: integer("balance").notNull(),
    creatorUserId: text("creatorUserId").references(() => users.id),
    createdAt: integer("createdAt")
      .notNull()
      .default(sql`strftime('%s', 'now')`),
  },
  (table) => ({
    uniqueIdx: uniqueIndex("walletTransactCreatedUIdx").on(
      table.id,
      table.walletId,
      table.createdAt
    ),
  })
);

const gamerWords = sqliteTable("gamerWords", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  word: text("word").notNull(),
  cost: integer("cost").notNull(),
  response: text("response"),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`strftime('%s','now')`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`strftime('%s','now')`),
});

const gamerWordPhrases = sqliteTable("gamerWordPhrases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gamerWordId: integer("gamerWordId").references(() => gamerWords.id),
  phrase: text("phrase").notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`strftime('%s','now')`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`strftime('%s','now')`),
});

const permissions = sqliteTable("permissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`strftime('%s','now')`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`strftime('%s','now')`),
});

const userPermissions = sqliteTable(
  "userPermissions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("userId").notNull(),
    permissionId: integer("permissionId").notNull(),
    active: integer("active", { mode: "boolean" }).notNull(),
    createdAt: integer("createdAt")
      .notNull()
      .default(sql`strftime('%s','now')`),
    updatedAt: integer("updatedAt")
      .notNull()
      .default(sql`strftime('%s','now')`),
  },
  (table) => ({
    uniqueIdx: uniqueIndex("userPermUIdx").on(table.userId, table.permissionId),
  })
);

export {
  users,
  bonkWallets,
  bonkWalletTransactions,
  gamerWords,
  gamerWordPhrases,
  permissions,
  userPermissions,
};

export default [
  users,
  bonkWallets,
  bonkWalletTransactions,
  gamerWords,
  gamerWordPhrases,
  permissions,
  userPermissions,
];

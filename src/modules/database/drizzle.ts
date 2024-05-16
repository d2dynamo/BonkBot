import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

export enum DatabaseType {
  bonkDb = "bonk.db",
}

export default function (dbt: DatabaseType) {
  if (!process.env.SQLITE_DB_PATH) {
    throw new Error("SQLITE_DB_PATH is not set.");
  }

  const sqlite = new Database(`${process.env.SQLITE_DB_PATH}/${dbt}`);
  const db = drizzle(sqlite);
  return db;
}

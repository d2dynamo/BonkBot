import Database from "better-sqlite3";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";

export enum DatabaseType {
  bonkDb = "bonk_db",
}

export default function (dbt: DatabaseType) {
  const sqlite = new Database(`${process.env.SQLITE_DB_PATH}/${dbt}`);
  const db = drizzle(sqlite);
  return db;
}

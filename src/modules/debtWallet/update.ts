import { Int, UniqueIdentifier, BigInt } from "mssql";
import {
  MSSQLDatabaseType as dbList,
  getMSSQLRequest,
} from "../../database/mssql";
import { UserId } from "../../interfaces/database";
import parseUserId from "../users/userId";

/**
 * Update wallet.
 * @param walletId wallet id
 */
export async function updateWallet(walletId: string, balance: number) {
  const sql = await getMSSQLRequest(dbList.bonkDb);

  sql.input("walletId", UniqueIdentifier, walletId);
  sql.input("balance", Int, balance);

  const query = `--sql
    UPDATE 
      bonk_wallets
    SET
      balance = @balance,
      updated_at = SYSUTCDATETIME()
    WHERE
      id = @walletId
  `;

  const result = await sql.query(query);

  if (result.rowsAffected[0] === 0) {
    throw new Error("Failed to update wallet.");
  }

  return true;
}

/**
 * Update user wallet.
 * @param userId discord uid
 * @param balance
 */
export default async function updateUserWallet(
  userId: UserId,
  balance: number
) {
  parseUserId(userId);

  const sql = await getMSSQLRequest(dbList.bonkDb);

  sql.input("userId", BigInt, userId);
  sql.input("balance", Int, balance);

  const query = `--sql
    UPDATE 
      bonk_wallets
    SET
      balance = @balance,
      updated_at = SYSUTCDATETIME()
    WHERE
      user_id = @userId
  `;

  const result = await sql.query(query);

  if (result.rowsAffected[0] === 0) {
    throw new Error("Failed to update wallet.");
  }

  return true;
}

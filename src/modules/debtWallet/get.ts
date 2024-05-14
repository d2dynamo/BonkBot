import { UniqueIdentifier, VarChar } from "mssql";
import {
  MSSQLDatabaseType as dbList,
  getMSSQLRequest,
} from "../../database/mssql";
import { BonkDebtWallet, UserId } from "../../interfaces/database";
import { UserError } from "../errors";
import parseUserId from "../users/userId";

export async function getWallet(walletId: string): Promise<BonkDebtWallet> {
  const sql = await getMSSQLRequest(dbList.bonkDb);

  sql.input("walletId", UniqueIdentifier, walletId);

  const query = `--sql
    SELECT
      id,
      balance,
      created_at,
      updated_at
    FROM
      bonk_wallets
    WHERE
      id = @walletId
  `;

  const result = await sql.query(query);

  if (result.recordset.length === 0) {
    throw new UserError("Wallet not found");
  }

  return result.recordset[0];
}

/**
 * Get wallet for user.
 * @param id discord uid
 * @returns Wallet object
 */
export default async function getUserWallet(
  id: UserId
): Promise<BonkDebtWallet> {
  parseUserId(id);
  const sql = await getMSSQLRequest(dbList.bonkDb);

  sql.input("userId", VarChar, id);

  const query = `--sql
  WITH LatestTransaction AS (
    SELECT 
      wallet_id,
      balance,
      ROW_NUMBER() OVER (PARTITION BY wallet_id ORDER BY created_at DESC) AS rn
    FROM 
      bonk_wallet_transactions
  )
  SELECT 
    bw.id AS wallet_id,
    bw.user_id,
    bw.created_at,
    bw.updated_at,
    COALESCE(lt.balance, 0) AS current_balance
  FROM 
    bonk_wallets bw
  LEFT JOIN 
    LatestTransaction lt
  ON 
    bw.id = lt.wallet_id AND lt.rn = 1
  WHERE 
    bw.user_id = @userId
  `;

  const result = await sql.query(query);

  if (result.recordset.length === 0) {
    throw new UserError("Wallet not found");
  }

  return {
    id: result.recordset[0].id,
    userId: id,
    balance: result.recordset[0].current_balance,
    createdAt: result.recordset[0].created_at,
    updatedAt: result.recordset[0].updated_at,
  };
}

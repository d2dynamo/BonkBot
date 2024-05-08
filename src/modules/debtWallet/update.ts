import { Int, VarChar } from "mssql";
import {
  MSSQLDatabaseType as dbList,
  getMSSQLRequest,
} from "../../database/mssql";

/**
 *
 * @param walletId wallet id
 * @returns Updated wallet object
 */
export default async function updateWallet(walletId: string, balance: number) {
  const sql = await getMSSQLRequest(dbList.bonkData);

  sql.input("walletId", VarChar, walletId);
  sql.input("balance", Int, balance);

  const query = `--sql
    UPDATE 
      debt_wallets
    SET
      balance = @balance,
      updated_at = GETDATE()
    WHERE
      id = @walletId
  `;

  const result = await sql.query(query);

  if (result.rowsAffected[0] === 0) {
    throw new Error("Failed to update wallet.");
  }

  return result.recordset[0];
}

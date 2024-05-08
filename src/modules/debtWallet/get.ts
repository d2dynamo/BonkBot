import { VarChar } from "mssql";
import {
  MSSQLDatabaseType as dbList,
  getMSSQLRequest,
} from "../../database/mssql";
import { BonkDebtWallet, User } from "../../interfaces/database";
import { UserError } from "../errors";

/**
 * Get wallet for user.
 * @param id sql GUID
 * @returns Wallet object
 */
export default async function getUserWallet(
  id: string
): Promise<BonkDebtWallet> {
  const sql = await getMSSQLRequest(dbList.bonkData);

  sql.input("userId", VarChar, id);

  const query = `--sql
    SELECT
      id,
      balance,
      created_at,
      updated_at
    FROM
      debt_wallets
    WHERE
      user_id = @userId
  `;

  const result = await sql.query(query);

  if (result.recordset.length === 0) {
    throw new UserError("Wallet not found");
  }

  return result.recordset[0];
}

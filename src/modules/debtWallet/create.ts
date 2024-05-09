import { VarChar } from "mssql";
import {
  MSSQLDatabaseType as dbList,
  getMSSQLRequest,
} from "../../database/mssql";

// TODO: Also create a 'transactions' table for storing history of wallet events.

/**
 *
 * @param userId discord uid for who the wallet belongs to
 * @returns User object
 */
export default async function createWallet(userId: number) {
  const sql = await getMSSQLRequest(dbList.bonkDb);

  sql.input("userId", VarChar, userId);

  const query = `--sql
    INSERT INTO 
      debt_wallets (
        id,
        user_id,
        balance,
        created_at,
        updated_at
      ) VALUES (
        NEWSEQUENTIALID(),
        @userId,
        0,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
      )
  `;

  const result = await sql.query(query);

  if (result.rowsAffected[0] === 0) {
    throw new Error("Failed to create wallet.");
  }

  return result.recordset[0];
}

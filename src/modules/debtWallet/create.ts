import { Int, VarChar } from "mssql";
import {
  MSSQLDatabaseType as dbList,
  getMSSQLRequest,
} from "../../database/mssql";
import { BonkDebtWallet, UserId } from "../../interfaces/database";
import parseUserId from "../users/userId";

// TODO: Fix this with the transactions table where balance is stored

/**
 *
 * @param userId discord uid for who the wallet belongs to
 * @returns Wallet object
 */
export default async function createWallet(
  userId: UserId,
  startingBalance: number = 0
): Promise<boolean> {
  parseUserId(userId);

  const sql = await getMSSQLRequest(dbList.bonkDb);

  sql.input("userId", VarChar, userId);
  //sql.input("sb", Int, startingBalance);

  const query = `--sql
    INSERT INTO 
      bonk_wallets (
        user_id,
        created_at,
        updated_at
      ) VALUES (
        @userId,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
      )
  `;

  const result = await sql.query(query);

  if (result.rowsAffected[0] === 0) {
    throw new Error("Failed to create wallet.");
  }

  return true;
}

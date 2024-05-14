import { VarChar } from "mssql";
import {
  MSSQLDatabaseType as dbList,
  getMSSQLRequest,
} from "../../database/mssql";
import { UserId } from "../../interfaces/database";

/**
 *
 * @param discordUID discord uid
 * @returns User object
 */
export default async function createUser(discordUID: UserId) {
  const sql = await getMSSQLRequest(dbList.bonkDb);

  sql.input("duid", VarChar, discordUID);

  const query = `--sql
    INSERT INTO 
      users (
        id,
        created_at,
        updated_at
      ) VALUES (
        @duid,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
      )
  `;

  const result = await sql.query(query);

  if (result.rowsAffected[0] === 0) {
    throw new Error("Failed to create user");
  }

  return true;
}

import { VarChar } from "mssql";
import {
  MSSQLDatabaseType as dbList,
  getMSSQLRequest,
} from "../../database/mssql";

// TODO: Maybe just trust discord uid and use it as primary key, skipping database own unique id.

/**
 *
 * @param userId discord uid
 * @returns User object
 */
export default async function createUser(discordUId: string) {
  const sql = await getMSSQLRequest(dbList.bonkData);

  sql.input("duid", VarChar, discordUId);

  const query = `--sql
    INSERT INTO 
      users (
        id,
        discord_id,
        created_at,
        updated_at
      ) VALUES (
        NEWSEQUENTIALID(),
        @duid,
        GETDATE(),
        GETDATE()
      )
  `;

  const result = await sql.query(query);

  if (result.rowsAffected[0] === 0) {
    throw new Error("Failed to create user");
  }

  return result.recordset[0];
}

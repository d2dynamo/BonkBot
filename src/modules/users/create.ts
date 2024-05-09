import { BigInt } from "mssql";
import {
  MSSQLDatabaseType as dbList,
  getMSSQLRequest,
} from "../../database/mssql";

// TODO: Maybe just trust discord uid and use it as primary key, skipping database own unique id.

/**
 *
 * @param discordUId discord uid
 * @returns User object
 */
export default async function createUser(discordUId: number) {
  const sql = await getMSSQLRequest(dbList.bonkDb);

  sql.input("duid", BigInt, discordUId);

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

  return result.recordset[0];
}

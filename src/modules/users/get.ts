import { VarChar } from "mssql";
import {
  MSSQLDatabaseType as dbList,
  getMSSQLRequest,
} from "../../database/mssql";
import { User } from "../../interfaces/database";
import { UserError } from "../errors";

/**
 * Get user by id or discord uid.
 * Must get user id from here if you need userId for other operations.
 * @param id sql GUID
 * @param discordUId discord uid
 * @returns User object
 */
export default async function getUser(
  id?: string,
  discordUId?: string
): Promise<User> {
  if (!id && !discordUId) {
    throw new Error("Missing id or discordUId");
  }

  const sql = await getMSSQLRequest(dbList.bonkData);

  sql.input("duid", VarChar, discordUId);
  sql.input("userId", VarChar, id);

  const query = `--sql
    SELECT
      id,
      discord_id,
      created_at,
      updated_at
    FROM
      users
    WHERE
      id = @userId OR discord_id = @duid
  `;

  const result = await sql.query(query);

  if (result.recordset.length === 0) {
    throw new UserError("User not found");
  }

  return result.recordset[0];
}

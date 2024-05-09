import { BigInt } from "mssql";
import {
  MSSQLDatabaseType as dbList,
  getMSSQLRequest,
} from "../../database/mssql";
import { User, UserId } from "../../interfaces/database";
import { UserError } from "../errors";

/**
 * Get user by id or discord uid.
 * Must get user id from here if you need userId for other operations.
 * @param id sql GUID
 * @returns User object
 */
export default async function getUser(id: UserId): Promise<User> {
  const sql = await getMSSQLRequest(dbList.bonkDb);

  sql.input("userId", BigInt, id);

  const query = `--sql
    SELECT
      id,
      created_at,
      updated_at
    FROM
      users
    WHERE
      id = @userId
  `;

  const result = await sql.query(query);

  if (result.recordset.length === 0) {
    throw new UserError("User not found");
  }

  return result.recordset[0];
}

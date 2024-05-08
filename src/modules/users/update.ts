import { VarChar } from "mssql";
import {
  MSSQLDatabaseType as dbList,
  getMSSQLTransaction,
} from "../../database/mssql";
import getUser from "./get";

/**
 * Currently useless but will be useful in future. Also testing out transactions here dont mind me.
 * @param id sql GUID
 * @param userId discord uid
 * @returns User object
 */
async function updateUser(id?: string, discordUId?: string) {
  if (!id && !discordUId) {
    throw new Error("Missing id or discordUId");
  }

  await getUser(id, discordUId);

  const sqlTx = await getMSSQLTransaction(dbList.bonkData);
  if (!sqlTx) {
    throw new Error("Failed to get MSSQL transaction");
  }

  await sqlTx.begin();

  try {
    const sql = sqlTx.request();

    sql.input("id", VarChar, id);
    sql.input("duid", VarChar, discordUId);

    const query = `--sql
      UPDATE
        users
      SET
        updated_at = GETDATE()
      WHERE
        id = @id OR discord_id = @duid
    `;

    const result = await sql.query(query);

    if (result.rowsAffected[0] === 0) {
      throw new Error("Failed to update user");
    }

    return result.recordset[0];
  } catch (err) {
    await sqlTx.rollback();
    throw err;
  } finally {
    await sqlTx.commit();
  }
}

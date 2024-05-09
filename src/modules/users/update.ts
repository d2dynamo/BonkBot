import { VarChar } from "mssql";
import {
  MSSQLDatabaseType as dbList,
  getMSSQLTransaction,
} from "../../database/mssql";
import getUser from "./get";

/**
 * Currently useless but will be useful in future. Also testing out transactions here dont mind me.
 * @param id discord uid
 * @returns User object
 */
export default async function updateUser(id: number) {
  await getUser(id);

  const sqlTx = await getMSSQLTransaction(dbList.bonkDb);
  if (!sqlTx) {
    throw new Error("Failed to get MSSQL transaction");
  }

  await sqlTx.begin();

  try {
    const sql = sqlTx.request();

    sql.input("id", VarChar, id);

    const query = `--sql
      UPDATE
        users
      SET
        updated_at = SYSUTCDATETIME()
      WHERE
        id = @id
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

import { VarChar } from "mssql";
import {
  MSSQLDatabaseType as dbList,
  getMSSQLTransaction,
} from "../../database/mssql";
import getUser from "./get";
import { UserId } from "../../interfaces/database";

/**
 * Currently useless but will be useful in future. Also testing out transactions here dont mind me.
 * @param id discord uid
 */
export default async function updateUser(id: UserId) {
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

    return true;
  } catch (err) {
    await sqlTx.rollback();
    throw err;
  } finally {
    await sqlTx.commit();
  }
}

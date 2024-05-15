import sql from "mssql";
// forget mssql. shits not worth the trouble. LIKE WHY THE F CAN ONLY BEEKEEPER LOGIN TO THE SERVER
if (
  !process.env.MSSQL_USER ||
  !process.env.MSSQL_PASSWORD ||
  !process.env.MSSQL_SERVER
) {
  throw new Error("MSSQL_USER || MSSQL_PASSWORD || MSSQL_SERVER missing.");
}

const dbPools = new Map<MSSQLDatabaseType, sql.ConnectionPool | null>();

export enum MSSQLDatabaseType {
  bonkDb = "bonk_db",
}

/**@deprecated */
async function initMSSQLPool(dbt: MSSQLDatabaseType): Promise<void> {
  if (dbPools.get(dbt)?.connected) {
    return;
  }

  let port = process.env.MSSQL_PORT ? +process.env.MSSQL_PORT : 1433;

  if (typeof process.env.MSSQL_PORT === "string") {
    port = parseInt(process.env.MSSQL_PORT);
  }

  dbPools.set(
    dbt,
    new sql.ConnectionPool({
      user: process.env.MSSQL_USER!,
      password: process.env.MSSQL_PASSWORD!,
      server: process.env.MSSQL_SERVER!,
      database: dbt!,
      port,
      options: {
        appName: "bonk_bot_discord",
        trustServerCertificate: true,
        connectTimeout: 5000,
      },
      pool: {
        min: 1,
        max: 40,
      },
      parseJSON: true,
    })
  );

  try {
    await dbPools.get(dbt)!.connect();
  } catch (err) {
    console.error("failed to init MSSQL pool: ", err);
    dbPools.set(dbt, null);
    return;
  }

  dbPools.get(dbt)!.on("error", async (err) => {
    console.error("MSSQL pool error", err);
    dbPools.get(dbt)?.removeAllListeners();
    dbPools.set(dbt, null);
  });
}

/**@deprecated */
export async function getMSSQLPool(
  dbt: MSSQLDatabaseType
): Promise<sql.ConnectionPool> {
  if (!dbPools.get(dbt) || dbPools.get(dbt)?.connected === false) {
    await initMSSQLPool(dbt);

    if (!dbPools.get(dbt)) {
      throw new Error("MSSQL pool is not initialized");
    }
  }

  return dbPools.get(dbt)!;
}

/**@deprecated */
export async function getMSSQLRequest(
  dbt: MSSQLDatabaseType
): Promise<sql.Request> {
  const p = await getMSSQLPool(dbt);

  return p.request();
}

/**@deprecated */
export async function getMSSQLTransaction(
  dbt: MSSQLDatabaseType
): Promise<sql.Transaction> {
  const p = await getMSSQLPool(dbt);

  return p.transaction();
}

/**@deprecated */
export function getMSSQLPreparedStatement(
  tr: sql.Transaction
): sql.PreparedStatement {
  return new sql.PreparedStatement(tr);
}

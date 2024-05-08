import sql from "mssql";

if (
  !process.env.BONK_BOT_MSSQL_USER ||
  !process.env.BONK_BOT_MSSQL_PASSWORD ||
  !process.env.BONK_BOT_MSSQL_SERVER
) {
  throw new Error(
    "BONK_BOT_MSSQL_USER || BONK_BOT_MSSQL_PASSWORD || BONK_BOT_MSSQL_SERVER missing."
  );
}

const dbPools = new Map<MSSQLDatabaseType, sql.ConnectionPool | null>();

export enum MSSQLDatabaseType {
  bonkData = "bonk_data",
}

async function initMSSQLPool(dbt: MSSQLDatabaseType): Promise<void> {
  if (dbPools.get(dbt)?.connected) {
    return;
  }

  const port = process.env.BONK_BOT_MSSQL_PORT
    ? +process.env.BONK_BOT_MSSQL_PORT
    : 1433;

  dbPools.set(
    dbt,
    new sql.ConnectionPool({
      user: process.env.BONK_BOT_MSSQL_USER!,
      password: process.env.BONK_BOT_MSSQL_PASSWORD!,
      server: process.env.BONK_BOT_MSSQL_SERVER!,
      database: dbt!,
      port,
      options: {
        appName: "bonk_bot_server",
        trustServerCertificate: true,
        connectTimeout: 5000,
      },
      pool: {
        min: 10,
        max: 100,
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

export async function getMSSQLRequest(
  dbt: MSSQLDatabaseType
): Promise<sql.Request> {
  const p = await getMSSQLPool(dbt);

  return p.request();
}

export async function getMSSQLTransaction(
  dbt: MSSQLDatabaseType
): Promise<sql.Transaction> {
  const p = await getMSSQLPool(dbt);

  return p.transaction();
}

export function getMSSQLPreparedStatement(
  tr: sql.Transaction
): sql.PreparedStatement {
  return new sql.PreparedStatement(tr);
}

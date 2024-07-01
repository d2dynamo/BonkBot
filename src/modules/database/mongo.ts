import { MongoClient, type MongoClientOptions, ObjectId } from "mongodb";
import { bonkCollections } from "../../interfaces/database";

let client: MongoClient | null;

export async function connectCollection(collection: bonkCollections) {
  if (client) {
    return client.db(process.env.MONGO_DB_NAME).collection<DocDef>(collection);
  }

  let conn = await mongoClient();
  const testColl = conn
    .db(process.env.MONGO_DB_NAME)
    .collection<DocDef>(collection);
}

export async function getDbConnection(dbName?: string) {
  if (!process.env.MONGO_URL || !dbName) {
    throw new Error("MONGO_URL is not set");
  }

  if (client) return client.db(dbName || process.env.MONGO_DB_NAME);

  let conn = await mongoClient();
  return conn.db(dbName || process.env.MONGO_DB_NAME);
}

export async function mongoClient() {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not set");
  }

  if (client) return client;

  const mongoOpt: MongoClientOptions = {
    appName: "bonkbot",
    maxPoolSize: 30,
    minPoolSize: 3,
    maxIdleTimeMS: 1000 * 60 * 5,
    ssl: true,
    tlsCAFile: process.env.MONGO_CA,
    tlsCertificateKeyFile: process.env.MONGO_CERT,
    tlsInsecure: true,
    authSource: "$external",
  };

  client = new MongoClient(process.env.MONGO_URL, mongoOpt);

  await client.connect();

  return client;
}

export async function stringToObjectId(id: string | ObjectId) {
  if (id instanceof ObjectId) {
    return id;
  }

  if (typeof id === "string" && id.length === 24) {
    return new ObjectId(id);
  }

  return false;
}

export function stringToObjectIdSync(id: string | ObjectId) {
  if (id instanceof ObjectId) {
    return id;
  }

  if (typeof id === "string" && id.length === 24) {
    return new ObjectId(id);
  }

  return false;
}

/**
 * will return empty objectId if not valid input
 */
export async function stringToObjectIdForce(id: any) {
  if (id instanceof ObjectId) {
    return id;
  }

  if (typeof id === "string" && id.length === 24) {
    return new ObjectId(id);
  }

  return new ObjectId();
}

/**
 * will return empty objectId if not valid input
 */
export function stringToObjectIdSyncForce(id: any) {
  if (id instanceof ObjectId) {
    return id;
  }

  if (typeof id === "string" && id.length === 24) {
    return new ObjectId(id);
  }

  return new ObjectId();
}

export const mongoDbName = process.env.MONGO_DB_NAME || "";

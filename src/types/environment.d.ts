declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";

      DBOT_TOKEN: string;
      DBOT_APP_ID: string;
      DBOT_PUBLIC_KEY: string;

      SQLITE_DB_PATH: string;

      /** Mongodb host n port. "mongodb://host:port" */
      MONGO_URL: string;
      /** ca.pem file */
      MONGO_CA: string;
      /** client.pem file */
      MONGO_CERT: string;
      /** default db name */
      MONGO_DB_NAME: string;
    }
  }
}

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";

      DBOT_TOKEN: string;
      DBOT_APP_ID: string;
      DBOT_PUBLIC_KEY: string;

      SQLITE_DB_PATH: string;
    }
  }
}

export {};

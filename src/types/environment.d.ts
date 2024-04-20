declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      HTTP_PORT: string;
      HTTPS_PORT: string;

      HTTPS_KEY_PATH: string;
      HTTPS_CERT_PATH: string;

      DBOT_TOKEN: string;
    }
  }
}

export {};

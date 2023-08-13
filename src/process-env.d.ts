declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production' | 'test';
      MYSQL_ADDRESS?: string;
      MYSQL_USERNAME?: string;
      MYSQL_PASSWORD?: string;
      MYSQL_DATABASE?: string;
      LOGIN_PASSWORD?: string;
    }
  }
}

export {};

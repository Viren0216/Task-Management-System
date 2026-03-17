import { envConfig } from './env';

// Export everything config-related from a single entry point
export const config = {
  env: envConfig.NODE_ENV,
  port: envConfig.PORT,
  dbUrl: envConfig.DATABASE_URL,
  jwt: {
    accessSecret: envConfig.JWT_ACCESS_SECRET,
    refreshSecret: envConfig.JWT_REFRESH_SECRET,
  }
};

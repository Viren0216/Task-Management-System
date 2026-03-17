/**
 * Primary Server Entrypoint.
 * Connects infrastructure components (like Database) and starts HTTP Express listeners.
 */
import app from './app';
import { envConfig } from './config/env';

const startServer = async () => {
  try {
    // Note: Database connections (e.g. Prisma) will be initialized here once set up fully

    app.listen(envConfig.PORT, () => {
      console.log(`✅ Server gracefully launched in [${envConfig.NODE_ENV}] mode on port ${envConfig.PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server', error);
    process.exit(1);
  }
};

startServer();

/**
 * Handle unresolved async promise rejections that occurred outside standard express context
 * (e.g. lost database connections, async timeout queues failing).
 */
process.on('unhandledRejection', (err: Error) => {
  console.error(`🚨 SYSTEM EXIT - Unhandled Rejection: ${err.message}`);
  // Attempt to safely close the server contexts without corrupting currently active operations
  process.exit(1);
});

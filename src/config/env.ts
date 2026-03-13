import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from our generic `.env` configuration
dotenv.config();

/**
 * We define a Zod schema for our environment variables.
 * This ensures that if the server boots up without critical env variables,
 * it crashes immediately with a helpful error rather than failing unpredictably later.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().min(1, "Database URL is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "Access secret is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "Refresh secret is required"),
});

// Validate process.env against the strict schema
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Environment Variable Validation Failed:', _env.error.format());
  process.exit(1);
}

// Export a strongly-typed, safely parsed configuration object
export const envConfig = _env.data;

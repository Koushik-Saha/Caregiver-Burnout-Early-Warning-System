import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema.js';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://user:password@ep-cool-pool-123456.us-east-2.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from './schema.js';

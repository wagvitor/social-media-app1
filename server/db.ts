import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let db: any = null;

// Only initialize database if DATABASE_URL is provided and valid
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    console.log('Database connected successfully');
  } catch (error) {
    console.warn('Database connection failed, falling back to memory storage:', error);
    pool = null;
    db = null;
  }
} else {
  console.log('No valid DATABASE_URL provided, using memory storage');
  pool = null;
  db = null;
}

export { pool, db };
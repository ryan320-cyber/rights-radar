import dotenv from 'dotenv';
dotenv.config();

import { createPool } from './index.ts';

export async function initDatabase() {
  const pool = createPool();

  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database successfully.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        display_name TEXT,
        photo_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        profile TEXT NOT NULL,
        frequency TEXT NOT NULL,
        notification_pref TEXT NOT NULL,
        past_disruptions TEXT,
        past_claim_experience TEXT,
        frequent_airlines TEXT,
        annual_flight_count TEXT,
        preferred_feature TEXT,
        preferred_pricing_model TEXT,
        feedback_or_frustration TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS flight_scans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        flight_number TEXT NOT NULL,
        flight_date TEXT,
        route TEXT,
        delay_minutes INTEGER,
        amount_estimated INTEGER,
        claim_letter TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Tables verified / initialized in Neon PostgreSQL: users, waitlist, flight_scans');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database tables:', error);
    return false;
  }
}

// Run directly when executed via CLI
if (process.argv[1]?.endsWith('init.ts') || process.argv[1]?.endsWith('init.js')) {
  initDatabase().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

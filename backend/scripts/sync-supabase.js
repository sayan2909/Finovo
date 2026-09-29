const { Pool } = require('pg');
require('dotenv').config();

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  console.log('Ensuring 2FA columns on Supabase...');
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false');
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(64)');
  await pool.query("UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE email = 'sayanmallick553@gmail.com'");

  const res = await pool.query("SELECT id, name, email, two_factor_enabled, two_factor_secret FROM users WHERE email = 'sayanmallick553@gmail.com'");
  console.log('SUCCESS ON SUPABASE! USER:', JSON.stringify(res.rows, null, 2));

  await pool.end();
}

run().catch(console.error);

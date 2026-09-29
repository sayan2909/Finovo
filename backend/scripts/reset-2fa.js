const { PGlite } = require('@electric-sql/pglite');
const path = require('path');

async function run() {
  const p = new PGlite(path.join(__dirname, 'data', 'pgdata'));
  await p.query("UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE email = 'sayanmallick553@gmail.com'");
  const res = await p.query("SELECT id, name, email, two_factor_enabled, two_factor_secret FROM users WHERE email = 'sayanmallick553@gmail.com'");
  console.log('SUCCESS! UPDATED PGLITE USER:', JSON.stringify(res.rows, null, 2));
}

run().catch(console.error);

const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/medusa-test' });

async function check() {
  try {
    const res = await pool.query(`SELECT id, display_id, total, subtotal, tax_total, sales_channel_id FROM "order" ORDER BY display_id DESC LIMIT 5`);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error(e.message);
  }
  pool.end();
}
check();

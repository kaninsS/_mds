const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres@localhost/medusa-test' });
pool.query('SELECT o.display_id, o.total, o.currency_code FROM "order" o ORDER BY o.display_id DESC LIMIT 5;', (err, res) => {
  console.log(err ? err : res.rows);
  pool.end();
});

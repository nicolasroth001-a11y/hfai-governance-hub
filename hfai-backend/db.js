const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: process.env.PGSSLMODE === "disable" ? false : true
});

// PRINT EXACT SERVER + DB + SCHEMA + VERSION
pool.query(`
  SELECT 
    current_database() AS db,
    current_schema() AS schema,
    inet_server_addr() AS server_ip,
    inet_server_port() AS server_port,
    version() AS version
`)
  .then(r => console.log("REAL DB INFO:", r.rows[0]))
  .catch(e => console.error("DB INFO ERROR:", e));

module.exports = pool;
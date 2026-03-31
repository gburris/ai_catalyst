require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') })
const fs = require('fs')
const path = require('path')
const { pool } = require('./pool')

async function migrate() {
  const sqlPath = path.join(__dirname, 'migrations', '001_init.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')
  await pool.query(sql)
  await pool.end()
}

migrate().catch((err) => {
  process.stderr.write(`Migration failed: ${err.message}\n`)
  process.exit(1)
})

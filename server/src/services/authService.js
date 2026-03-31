const bcrypt = require('bcrypt')
const { pool } = require('../db/pool')

const SALT_ROUNDS = 12

async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT id, email, password_hash FROM users WHERE email = $1',
    [email]
  )
  return result.rows[0] || null
}

async function createUser({ email, password }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const result = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
    [email, passwordHash]
  )
  return result.rows[0]
}

async function verifyCredentials({ email, password }) {
  const user = await findUserByEmail(email)
  if (!user) return null
  const match = await bcrypt.compare(password, user.password_hash)
  if (!match) return null
  return { id: user.id, email: user.email }
}

module.exports = { findUserByEmail, createUser, verifyCredentials }

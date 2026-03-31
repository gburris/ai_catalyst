process.env.JWT_SECRET = 'test-secret-for-auth-tests-that-is-at-least-32-chars'
process.env.NODE_ENV = 'test'

const request = require('supertest')
const app = require('../app')
const { pool } = require('../db/pool')

beforeAll(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT now()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
      title      TEXT NOT NULL,
      completed  BOOLEAN DEFAULT false,
      priority   TEXT CHECK (priority IN ('low','medium','high')) DEFAULT 'medium',
      due_date   DATE,
      created_at TIMESTAMPTZ DEFAULT now(),
      deleted_at TIMESTAMPTZ
    )
  `)
})

beforeEach(async () => {
  await pool.query('DELETE FROM todos')
  await pool.query('DELETE FROM users')
})

afterAll(async () => {
  await pool.end()
})

describe('POST /api/auth/register', () => {
  test('success — returns 201 with user and sets cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@test.com', password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({ email: 'user@test.com' })
    expect(res.body.user.id).toBeDefined()
    expect(res.headers['set-cookie']).toBeDefined()
    const cookie = res.headers['set-cookie'][0]
    expect(cookie).toMatch(/token=/)
    expect(cookie).toMatch(/HttpOnly/)
  })

  test('duplicate email — returns 409', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'password123' })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('Email already in use')
  })

  test('weak password — returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@test.com', password: 'short' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/8 characters/)
  })

  test('invalid email — returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@test.com', password: 'password123' })
  })

  test('success — returns 200 with user and sets cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.user).toMatchObject({ email: 'login@test.com' })
    expect(res.headers['set-cookie']).toBeDefined()
  })

  test('wrong password — returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'wrongpass' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials')
  })

  test('unknown email — returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials')
  })
})

describe('POST /api/auth/logout', () => {
  test('clears the token cookie — returns 204', async () => {
    const res = await request(app).post('/api/auth/logout')
    expect(res.status).toBe(204)
    const cookie = res.headers['set-cookie']?.[0] ?? ''
    // Cookie should be cleared (expires in past or empty)
    expect(cookie).toMatch(/token=;|token=\s*;|Expires=Thu, 01 Jan 1970/)
  })
})

describe('GET /api/auth/me', () => {
  test('returns user when valid cookie present', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'me@test.com', password: 'password123' })

    const cookie = registerRes.headers['set-cookie'][0]

    const res = await request(app).get('/api/auth/me').set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.user).toMatchObject({ email: 'me@test.com' })
  })

  test('returns 401 when no cookie', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})

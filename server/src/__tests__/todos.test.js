process.env.JWT_SECRET = 'test-secret-for-todos-tests-that-is-at-least-32-chars'
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

async function registerAndGetCookie(email = 'user@test.com') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password: 'password123' })
  return res.headers['set-cookie'][0]
}

describe('POST /api/todos', () => {
  test('creates a todo — returns 201 with todo object', async () => {
    const cookie = await registerAndGetCookie()

    const res = await request(app)
      .post('/api/todos')
      .set('Cookie', cookie)
      .send({ title: 'Buy groceries', priority: 'high' })

    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Buy groceries')
    expect(res.body.priority).toBe('high')
    expect(res.body.completed).toBe(false)
    expect(res.body.id).toBeDefined()
  })

  test('title is required — returns 400', async () => {
    const cookie = await registerAndGetCookie()

    const res = await request(app)
      .post('/api/todos')
      .set('Cookie', cookie)
      .send({ priority: 'low' })

    expect(res.status).toBe(400)
  })

  test('requires auth — returns 401 without cookie', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'Should fail' })

    expect(res.status).toBe(401)
  })

  test('creates todo with dueDate', async () => {
    const cookie = await registerAndGetCookie()

    const res = await request(app)
      .post('/api/todos')
      .set('Cookie', cookie)
      .send({ title: 'Task with date', dueDate: '2026-12-31' })

    expect(res.status).toBe(201)
    expect(res.body.dueDate).toBe('2026-12-31')
  })
})

describe('GET /api/todos', () => {
  test('returns todos list with total', async () => {
    const cookie = await registerAndGetCookie()

    await request(app).post('/api/todos').set('Cookie', cookie).send({ title: 'Todo 1' })
    await request(app).post('/api/todos').set('Cookie', cookie).send({ title: 'Todo 2' })

    const res = await request(app).get('/api/todos').set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.todos).toHaveLength(2)
    expect(res.body.total).toBe(2)
  })

  test('filters by status=active', async () => {
    const cookie = await registerAndGetCookie()

    const createRes = await request(app)
      .post('/api/todos')
      .set('Cookie', cookie)
      .send({ title: 'Active todo' })

    const { id } = createRes.body
    await request(app).put(`/api/todos/${id}`).set('Cookie', cookie).send({ completed: true })
    await request(app).post('/api/todos').set('Cookie', cookie).send({ title: 'Another active' })

    const res = await request(app)
      .get('/api/todos')
      .set('Cookie', cookie)
      .query({ status: 'active' })

    expect(res.status).toBe(200)
    expect(res.body.todos).toHaveLength(1)
    expect(res.body.todos[0].title).toBe('Another active')
  })

  test('filters by status=completed', async () => {
    const cookie = await registerAndGetCookie()

    const createRes = await request(app)
      .post('/api/todos')
      .set('Cookie', cookie)
      .send({ title: 'Done todo' })

    const { id } = createRes.body
    await request(app).put(`/api/todos/${id}`).set('Cookie', cookie).send({ completed: true })
    await request(app).post('/api/todos').set('Cookie', cookie).send({ title: 'Not done' })

    const res = await request(app)
      .get('/api/todos')
      .set('Cookie', cookie)
      .query({ status: 'completed' })

    expect(res.status).toBe(200)
    expect(res.body.todos).toHaveLength(1)
    expect(res.body.todos[0].title).toBe('Done todo')
  })

  test('pagination — respects page and limit', async () => {
    const cookie = await registerAndGetCookie()

    await Promise.all([
      request(app).post('/api/todos').set('Cookie', cookie).send({ title: 'T1' }),
      request(app).post('/api/todos').set('Cookie', cookie).send({ title: 'T2' }),
      request(app).post('/api/todos').set('Cookie', cookie).send({ title: 'T3' }),
    ])

    const res = await request(app)
      .get('/api/todos')
      .set('Cookie', cookie)
      .query({ page: 1, limit: 2 })

    expect(res.status).toBe(200)
    expect(res.body.todos).toHaveLength(2)
    expect(res.body.total).toBe(3)
  })
})

describe('GET /api/todos/:id', () => {
  test('returns a single todo', async () => {
    const cookie = await registerAndGetCookie()
    const createRes = await request(app)
      .post('/api/todos')
      .set('Cookie', cookie)
      .send({ title: 'Single todo' })

    const res = await request(app)
      .get(`/api/todos/${createRes.body.id}`)
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Single todo')
  })

  test('ownership check — user B cannot access user A todo — returns 403', async () => {
    const cookieA = await registerAndGetCookie('a@test.com')
    const cookieB = await registerAndGetCookie('b@test.com')

    const createRes = await request(app)
      .post('/api/todos')
      .set('Cookie', cookieA)
      .send({ title: 'User A todo' })

    const res = await request(app)
      .get(`/api/todos/${createRes.body.id}`)
      .set('Cookie', cookieB)

    expect(res.status).toBe(403)
  })
})

describe('PUT /api/todos/:id', () => {
  test('updates title and returns updated todo', async () => {
    const cookie = await registerAndGetCookie()
    const createRes = await request(app)
      .post('/api/todos')
      .set('Cookie', cookie)
      .send({ title: 'Old title' })

    const res = await request(app)
      .put(`/api/todos/${createRes.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'New title' })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('New title')
  })

  test('toggles completed', async () => {
    const cookie = await registerAndGetCookie()
    const createRes = await request(app)
      .post('/api/todos')
      .set('Cookie', cookie)
      .send({ title: 'Toggle me' })

    const res = await request(app)
      .put(`/api/todos/${createRes.body.id}`)
      .set('Cookie', cookie)
      .send({ completed: true })

    expect(res.status).toBe(200)
    expect(res.body.completed).toBe(true)
  })

  test('ownership check — returns 403', async () => {
    const cookieA = await registerAndGetCookie('a2@test.com')
    const cookieB = await registerAndGetCookie('b2@test.com')

    const createRes = await request(app)
      .post('/api/todos')
      .set('Cookie', cookieA)
      .send({ title: 'A todo' })

    const res = await request(app)
      .put(`/api/todos/${createRes.body.id}`)
      .set('Cookie', cookieB)
      .send({ title: 'Hacked' })

    expect(res.status).toBe(403)
  })
})

describe('DELETE /api/todos/:id', () => {
  test('soft deletes — returns 204', async () => {
    const cookie = await registerAndGetCookie()
    const createRes = await request(app)
      .post('/api/todos')
      .set('Cookie', cookie)
      .send({ title: 'Delete me' })

    const deleteRes = await request(app)
      .delete(`/api/todos/${createRes.body.id}`)
      .set('Cookie', cookie)

    expect(deleteRes.status).toBe(204)

    // Should not appear in list
    const listRes = await request(app).get('/api/todos').set('Cookie', cookie)
    expect(listRes.body.todos).toHaveLength(0)

    // Verify record still in DB (soft delete)
    const dbRow = await pool.query('SELECT deleted_at FROM todos WHERE id = $1', [createRes.body.id])
    expect(dbRow.rows[0].deleted_at).not.toBeNull()
  })

  test('ownership check — returns 403', async () => {
    const cookieA = await registerAndGetCookie('a3@test.com')
    const cookieB = await registerAndGetCookie('b3@test.com')

    const createRes = await request(app)
      .post('/api/todos')
      .set('Cookie', cookieA)
      .send({ title: 'A todo' })

    const res = await request(app)
      .delete(`/api/todos/${createRes.body.id}`)
      .set('Cookie', cookieB)

    expect(res.status).toBe(403)
  })
})

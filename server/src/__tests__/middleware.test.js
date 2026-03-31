const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { authMiddleware } = require('../middleware/auth')

process.env.JWT_SECRET = 'test-secret-for-middleware-tests-at-least-32-chars'

// node-mocks-http is not available; use plain objects instead
function makeReqRes(cookieToken) {
  const req = { cookies: cookieToken ? { token: cookieToken } : {} }
  let statusCode
  let body
  const res = {
    status(code) {
      statusCode = code
      return res
    },
    json(data) {
      body = data
      return res
    },
    getStatus: () => statusCode,
    getBody: () => body,
  }
  return { req, res }
}

describe('authMiddleware', () => {
  const secret = process.env.JWT_SECRET

  test('valid token — calls next and sets req.user', () => {
    const token = jwt.sign({ id: 'user-1', email: 'a@b.com' }, secret, { expiresIn: '1h' })
    const { req, res } = makeReqRes(token)
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toEqual({ id: 'user-1', email: 'a@b.com' })
  })

  test('missing token — returns 401', () => {
    const { req, res } = makeReqRes(null)
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.getStatus()).toBe(401)
    expect(res.getBody()).toEqual({ error: 'Unauthorized' })
  })

  test('expired token — returns 401', () => {
    const token = jwt.sign({ id: 'user-1', email: 'a@b.com' }, secret, { expiresIn: '-1s' })
    const { req, res } = makeReqRes(token)
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.getStatus()).toBe(401)
  })

  test('tampered token — returns 401', () => {
    const token = jwt.sign({ id: 'user-1', email: 'a@b.com' }, 'wrong-secret', { expiresIn: '1h' })
    const { req, res } = makeReqRes(token)
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.getStatus()).toBe(401)
  })
})

describe('password hashing', () => {
  test('stored hash is never equal to plaintext', async () => {
    const plain = 'mysecretpassword'
    const hash = await bcrypt.hash(plain, 12)
    expect(hash).not.toBe(plain)
  })

  test('bcrypt.compare returns true for correct password', async () => {
    const plain = 'mysecretpassword'
    const hash = await bcrypt.hash(plain, 12)
    const result = await bcrypt.compare(plain, hash)
    expect(result).toBe(true)
  })

  test('bcrypt.compare returns false for wrong password', async () => {
    const hash = await bcrypt.hash('correctpassword', 12)
    const result = await bcrypt.compare('wrongpassword', hash)
    expect(result).toBe(false)
  })
})

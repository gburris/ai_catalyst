const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { findUserByEmail, createUser, verifyCredentials } = require('../services/authService')

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 1000, // 1 hour in ms
}

function setAuthCookie(res, user) {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
  res.cookie('token', token, COOKIE_OPTIONS)
}

async function register(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg })
    }

    const { email, password } = req.body

    const existing = await findUserByEmail(email)
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' })
    }

    const user = await createUser({ email, password })
    setAuthCookie(res, user)
    return res.status(201).json({ user: { id: user.id, email: user.email } })
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg })
    }

    const { email, password } = req.body
    const user = await verifyCredentials({ email, password })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    setAuthCookie(res, user)
    return res.status(200).json({ user: { id: user.id, email: user.email } })
  } catch (err) {
    next(err)
  }
}

function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: COOKIE_OPTIONS.httpOnly,
    secure: COOKIE_OPTIONS.secure,
    sameSite: COOKIE_OPTIONS.sameSite,
  })
  return res.sendStatus(204)
}

function getMe(req, res) {
  return res.status(200).json({ user: req.user })
}

module.exports = { register, login, logout, getMe }

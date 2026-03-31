const { Router } = require('express')
const { body } = require('express-validator')
const rateLimit = require('express-rate-limit')
const { register, login, logout, getMe } = require('../controllers/authController')
const { authMiddleware } = require('../middleware/auth')

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 10,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
]

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]

router.post('/register', authLimiter, registerValidation, register)
router.post('/login', authLimiter, loginValidation, login)
router.post('/logout', authLimiter, logout)
router.get('/me', authMiddleware, getMe)

module.exports = router

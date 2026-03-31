const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.id, email: payload.email }
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

module.exports = { authMiddleware }

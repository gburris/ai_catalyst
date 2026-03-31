// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500
  const body = { error: err.message || 'Internal server error' }
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    body.stack = err.stack
  }
  res.status(status).json(body)
}

module.exports = { errorHandler }

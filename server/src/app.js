const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const authRouter = require('./routes/auth')
const todosRouter = require('./routes/todos')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json())

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
}

app.use('/api/auth', authRouter)
app.use('/api/todos', todosRouter)

app.use(errorHandler)

module.exports = app

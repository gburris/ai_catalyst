require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGIN', 'NODE_ENV']
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    process.stderr.write(`Missing required environment variable: ${key}\n`)
    process.exit(1)
  }
}
if (process.env.JWT_SECRET.length < 32) {
  process.stderr.write('JWT_SECRET must be at least 32 characters\n')
  process.exit(1)
}

const app = require('./app')

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  process.stdout.write(`Server running on port ${PORT}\n`)
})

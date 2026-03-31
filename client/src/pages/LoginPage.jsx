import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import FormField from '../components/FormField.jsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  if (user) {
    navigate('/todos', { replace: true })
    return null
  }

  const successMessage = location.state?.message

  const validate = () => {
    const errors = {}
    if (!email.trim()) errors.email = 'Email is required'
    if (!password) errors.password = 'Password is required'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setServerError(null)
    setSubmitting(true)
    try {
      await login({ email, password })
      navigate('/todos')
    } catch (err) {
      setServerError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Enter your email and password to access your todos</CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <p className="mb-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
              {successMessage}
            </p>
          )}
          {serverError && (
            <p className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {serverError}
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Email" id="login-email" error={fieldErrors.email}>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={submitting}
              />
            </FormField>
            <FormField label="Password" id="login-password" error={fieldErrors.password}>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={submitting}
              />
            </FormField>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="underline underline-offset-4 hover:text-primary">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

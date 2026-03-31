import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, AuthContext } from '../context/AuthContext.jsx'
import { useContext } from 'react'

vi.mock('../api/authService.js', () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
}))

import { getMe, login, logout, register } from '../api/authService.js'

function TestConsumer() {
  const ctx = useContext(AuthContext)
  if (ctx.authLoading) return <p>Loading</p>
  return (
    <div>
      <p data-testid="user">{ctx.user ? ctx.user.email : 'none'}</p>
      <button onClick={() => ctx.login({ email: 'a@b.com', password: 'p' })}>Login</button>
      <button onClick={() => ctx.logout()}>Logout</button>
      <button onClick={() => ctx.register({ email: 'a@b.com', password: 'p' })}>Register</button>
    </div>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthContext', () => {
  it('sets user to null when getMe fails (no session)', async () => {
    getMe.mockRejectedValue(new Error('Unauthorized'))

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none')
    })
  })

  it('sets user when getMe succeeds', async () => {
    getMe.mockResolvedValue({ user: { id: '1', email: 'a@b.com' } })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('a@b.com')
    })
  })

  it('updates user state after login', async () => {
    const user = userEvent.setup()
    getMe.mockRejectedValue(new Error('Unauthorized'))
    login.mockResolvedValue({ user: { id: '1', email: 'a@b.com' } })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => screen.getByTestId('user'))

    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('a@b.com')
    })
  })

  it('clears user state after logout', async () => {
    const user = userEvent.setup()
    getMe.mockResolvedValue({ user: { id: '1', email: 'a@b.com' } })
    logout.mockResolvedValue(undefined)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => screen.getByText('a@b.com'))

    await user.click(screen.getByRole('button', { name: /logout/i }))

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none')
    })
  })

  it('calls register and returns data', async () => {
    const user = userEvent.setup()
    getMe.mockRejectedValue(new Error('Unauthorized'))
    register.mockResolvedValue({ message: 'Created' })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => screen.getByTestId('user'))

    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(register).toHaveBeenCalledWith({ email: 'a@b.com', password: 'p' })
  })
})

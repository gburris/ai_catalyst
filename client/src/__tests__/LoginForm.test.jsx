import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import LoginPage from '../pages/LoginPage.jsx'

const renderLoginPage = (loginMock = vi.fn()) => {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthContext.Provider
        value={{ user: null, authLoading: false, login: loginMock, logout: vi.fn(), register: vi.fn() }}
      >
        <LoginPage />
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  it('renders email input, password input, and submit button', () => {
    renderLoginPage()

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation error when email is empty', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('shows validation error when password is empty', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/email/i), 'a@b.com')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('calls login with email and password on valid submit', async () => {
    const user = userEvent.setup()
    const loginMock = vi.fn().mockResolvedValue({ user: { id: '1', email: 'a@b.com' } })
    renderLoginPage(loginMock)

    await user.type(screen.getByLabelText(/email/i), 'a@b.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret123' })
    })
  })

  it('shows server error when login rejects', async () => {
    const user = userEvent.setup()
    const loginMock = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    renderLoginPage(loginMock)

    await user.type(screen.getByLabelText(/email/i), 'a@b.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('disables submit button while login is in progress', async () => {
    const user = userEvent.setup()
    let resolve
    const loginMock = vi.fn(() => new Promise((res) => { resolve = res }))
    renderLoginPage(loginMock)

    await user.type(screen.getByLabelText(/email/i), 'a@b.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()

    resolve({ user: { id: '1', email: 'a@b.com' } })
  })

  it('has a link to the register page', () => {
    renderLoginPage()
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
  })
})

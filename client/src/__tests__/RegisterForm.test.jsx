import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'

const renderRegisterPage = (registerMock = vi.fn()) => {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <AuthContext.Provider
        value={{ user: null, authLoading: false, login: vi.fn(), logout: vi.fn(), register: registerMock }}
      >
        <RegisterPage />
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('RegisterPage', () => {
  it('renders email, password, confirm password inputs and submit button', () => {
    renderRegisterPage()

    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText(/^email/i), 'a@b.com')
    await user.type(screen.getByLabelText(/^password/i), 'secret123')
    await user.type(screen.getByLabelText(/confirm password/i), 'different')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })

  it('calls register with email and password on valid submit', async () => {
    const user = userEvent.setup()
    const registerMock = vi.fn().mockResolvedValue({})
    renderRegisterPage(registerMock)

    await user.type(screen.getByLabelText(/^email/i), 'a@b.com')
    await user.type(screen.getByLabelText(/^password/i), 'secret123')
    await user.type(screen.getByLabelText(/confirm password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret123' })
    })
  })

  it('shows server error when register rejects', async () => {
    const user = userEvent.setup()
    const registerMock = vi.fn().mockRejectedValue(new Error('Email already in use'))
    renderRegisterPage(registerMock)

    await user.type(screen.getByLabelText(/^email/i), 'a@b.com')
    await user.type(screen.getByLabelText(/^password/i), 'secret123')
    await user.type(screen.getByLabelText(/confirm password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument()
    })
  })

  it('has a link to the login page', () => {
    renderRegisterPage()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import NavBar from '../components/NavBar.jsx'

const renderNavBar = (user = null, logoutMock = vi.fn()) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{ user, authLoading: false, login: vi.fn(), logout: logoutMock, register: vi.fn() }}
      >
        <NavBar />
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('NavBar', () => {
  it('renders the app brand link', () => {
    renderNavBar()
    expect(screen.getByRole('link', { name: /todo app/i })).toBeInTheDocument()
  })

  it('shows user email and logout button when authenticated', () => {
    renderNavBar({ id: '1', email: 'a@b.com' })

    expect(screen.getByText('a@b.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('does not show logout button when unauthenticated', () => {
    renderNavBar(null)
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument()
  })

  it('calls logout when logout button is clicked', async () => {
    const user = userEvent.setup()
    const logoutMock = vi.fn().mockResolvedValue(undefined)
    renderNavBar({ id: '1', email: 'a@b.com' }, logoutMock)

    await user.click(screen.getByRole('button', { name: /logout/i }))

    expect(logoutMock).toHaveBeenCalled()
  })
})

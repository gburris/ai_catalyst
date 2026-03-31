import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'

const renderWithAuth = ({ user, authLoading }) => {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <AuthContext.Provider
        value={{ user, authLoading, login: vi.fn(), logout: vi.fn(), register: vi.fn() }}
      >
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<p>Protected content</p>} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('shows loading indicator while auth is loading', () => {
    renderWithAuth({ user: null, authLoading: true })
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('redirects to /login when user is not authenticated', () => {
    renderWithAuth({ user: null, authLoading: false })
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders the outlet when user is authenticated', () => {
    renderWithAuth({ user: { id: '1', email: 'a@b.com' }, authLoading: false })
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })
})

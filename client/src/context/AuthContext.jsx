import { createContext, useState, useEffect } from 'react'
import { login, logout, register, getMe } from '../api/authService.js'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await getMe()
        setUser(data.user)
      } catch {
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }
    checkSession()
  }, [])

  const handleLogin = async (credentials) => {
    const data = await login(credentials)
    setUser(data.user)
    return data
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
  }

  const handleRegister = async (credentials) => {
    const data = await register(credentials)
    return data
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }

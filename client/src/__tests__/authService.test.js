import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register, login, logout, getMe } from '../api/authService.js'
import { axiosInstance } from '../api/axiosInstance.js'

vi.mock('../api/axiosInstance.js', () => ({
  axiosInstance: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('authService', () => {
  describe('login', () => {
    it('sends POST /auth/login with credentials', async () => {
      const user = { id: '1', email: 'a@b.com' }
      axiosInstance.post.mockResolvedValue({ data: { user } })

      await login({ email: 'a@b.com', password: 'secret' })

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'a@b.com',
        password: 'secret',
      })
    })

    it('returns the response data', async () => {
      const user = { id: '1', email: 'a@b.com' }
      axiosInstance.post.mockResolvedValue({ data: { user } })

      const result = await login({ email: 'a@b.com', password: 'secret' })

      expect(result).toEqual({ user })
    })

    it('propagates errors', async () => {
      axiosInstance.post.mockRejectedValue(new Error('Invalid credentials'))

      await expect(login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow(
        'Invalid credentials'
      )
    })
  })

  describe('register', () => {
    it('sends POST /auth/register with credentials', async () => {
      axiosInstance.post.mockResolvedValue({ data: { message: 'Created' } })

      await register({ email: 'a@b.com', password: 'secret' })

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/register', {
        email: 'a@b.com',
        password: 'secret',
      })
    })

    it('returns response data', async () => {
      const expected = { message: 'Created' }
      axiosInstance.post.mockResolvedValue({ data: expected })

      const result = await register({ email: 'a@b.com', password: 'secret' })

      expect(result).toEqual(expected)
    })

    it('propagates errors', async () => {
      axiosInstance.post.mockRejectedValue(new Error('Email already in use'))

      await expect(register({ email: 'a@b.com', password: 'secret' })).rejects.toThrow(
        'Email already in use'
      )
    })
  })

  describe('logout', () => {
    it('sends POST /auth/logout', async () => {
      axiosInstance.post.mockResolvedValue({})

      await logout()

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/logout')
    })
  })

  describe('getMe', () => {
    it('sends GET /auth/me', async () => {
      const user = { id: '1', email: 'a@b.com' }
      axiosInstance.get.mockResolvedValue({ data: { user } })

      await getMe()

      expect(axiosInstance.get).toHaveBeenCalledWith('/auth/me')
    })

    it('returns user data', async () => {
      const user = { id: '1', email: 'a@b.com' }
      axiosInstance.get.mockResolvedValue({ data: { user } })

      const result = await getMe()

      expect(result).toEqual({ user })
    })
  })
})

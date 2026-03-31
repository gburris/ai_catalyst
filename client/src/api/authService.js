import { axiosInstance } from './axiosInstance.js'

const register = async ({ email, password }) => {
  const { data } = await axiosInstance.post('/auth/register', { email, password })
  return data
}

const login = async ({ email, password }) => {
  const { data } = await axiosInstance.post('/auth/login', { email, password })
  return data
}

const logout = async () => {
  await axiosInstance.post('/auth/logout')
}

const getMe = async () => {
  const { data } = await axiosInstance.get('/auth/me')
  return data
}

export { register, login, logout, getMe }

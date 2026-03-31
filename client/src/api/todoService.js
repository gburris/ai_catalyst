import { axiosInstance } from './axiosInstance.js'

const getTodos = async ({ page = 1, limit = 20, status } = {}) => {
  const params = { page, limit }
  if (status) params.status = status
  const { data } = await axiosInstance.get('/todos', { params })
  return data
}

const getTodo = async (id) => {
  const { data } = await axiosInstance.get(`/todos/${id}`)
  return data
}

const createTodo = async ({ title, dueDate, priority }) => {
  const body = { title }
  if (dueDate) body.dueDate = dueDate
  if (priority) body.priority = priority
  const { data } = await axiosInstance.post('/todos', body)
  return data
}

const updateTodo = async (id, fields) => {
  const { data } = await axiosInstance.put(`/todos/${id}`, fields)
  return data
}

const deleteTodo = async (id) => {
  await axiosInstance.delete(`/todos/${id}`)
}

export { getTodos, getTodo, createTodo, updateTodo, deleteTodo }

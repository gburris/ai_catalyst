import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTodos, getTodo, createTodo, updateTodo, deleteTodo } from '../api/todoService.js'
import { axiosInstance } from '../api/axiosInstance.js'

vi.mock('../api/axiosInstance.js', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('todoService', () => {
  describe('getTodos', () => {
    it('sends GET /todos with default params', async () => {
      axiosInstance.get.mockResolvedValue({ data: { todos: [], total: 0, page: 1, limit: 20 } })

      await getTodos()

      expect(axiosInstance.get).toHaveBeenCalledWith('/todos', {
        params: { page: 1, limit: 20 },
      })
    })

    it('includes status param when provided', async () => {
      axiosInstance.get.mockResolvedValue({ data: { todos: [], total: 0, page: 1, limit: 20 } })

      await getTodos({ status: 'active' })

      expect(axiosInstance.get).toHaveBeenCalledWith('/todos', {
        params: { page: 1, limit: 20, status: 'active' },
      })
    })

    it('omits status param when not provided', async () => {
      axiosInstance.get.mockResolvedValue({ data: { todos: [], total: 0, page: 1, limit: 20 } })

      await getTodos({ page: 2 })

      const callParams = axiosInstance.get.mock.calls[0][1].params
      expect(callParams).not.toHaveProperty('status')
    })

    it('returns the response data', async () => {
      const expected = { todos: [{ id: '1', title: 'Test' }], total: 1, page: 1, limit: 20 }
      axiosInstance.get.mockResolvedValue({ data: expected })

      const result = await getTodos()

      expect(result).toEqual(expected)
    })
  })

  describe('getTodo', () => {
    it('sends GET /todos/:id', async () => {
      axiosInstance.get.mockResolvedValue({ data: { id: '1', title: 'Test' } })

      await getTodo('1')

      expect(axiosInstance.get).toHaveBeenCalledWith('/todos/1')
    })
  })

  describe('createTodo', () => {
    it('sends POST /todos with title', async () => {
      axiosInstance.post.mockResolvedValue({ data: { id: '1', title: 'Buy milk' } })

      await createTodo({ title: 'Buy milk' })

      expect(axiosInstance.post).toHaveBeenCalledWith('/todos', { title: 'Buy milk' })
    })

    it('includes optional fields when provided', async () => {
      axiosInstance.post.mockResolvedValue({ data: { id: '1', title: 'Buy milk' } })

      await createTodo({ title: 'Buy milk', dueDate: '2026-04-01', priority: 'high' })

      expect(axiosInstance.post).toHaveBeenCalledWith('/todos', {
        title: 'Buy milk',
        dueDate: '2026-04-01',
        priority: 'high',
      })
    })

    it('omits optional fields when undefined', async () => {
      axiosInstance.post.mockResolvedValue({ data: { id: '1', title: 'Buy milk' } })

      await createTodo({ title: 'Buy milk' })

      const body = axiosInstance.post.mock.calls[0][1]
      expect(body).not.toHaveProperty('dueDate')
      expect(body).not.toHaveProperty('priority')
    })
  })

  describe('updateTodo', () => {
    it('sends PUT /todos/:id with fields', async () => {
      axiosInstance.put.mockResolvedValue({ data: { id: '1', completed: true } })

      await updateTodo('1', { completed: true })

      expect(axiosInstance.put).toHaveBeenCalledWith('/todos/1', { completed: true })
    })

    it('returns updated todo', async () => {
      const updated = { id: '1', completed: true, title: 'Done' }
      axiosInstance.put.mockResolvedValue({ data: updated })

      const result = await updateTodo('1', { completed: true })

      expect(result).toEqual(updated)
    })
  })

  describe('deleteTodo', () => {
    it('sends DELETE /todos/:id', async () => {
      axiosInstance.delete.mockResolvedValue({})

      await deleteTodo('1')

      expect(axiosInstance.delete).toHaveBeenCalledWith('/todos/1')
    })
  })

  describe('error propagation', () => {
    it('getTodos propagates errors', async () => {
      axiosInstance.get.mockRejectedValue(new Error('Unauthorized'))
      await expect(getTodos()).rejects.toThrow('Unauthorized')
    })

    it('createTodo propagates errors', async () => {
      axiosInstance.post.mockRejectedValue(new Error('Validation failed'))
      await expect(createTodo({ title: 'X' })).rejects.toThrow('Validation failed')
    })
  })
})

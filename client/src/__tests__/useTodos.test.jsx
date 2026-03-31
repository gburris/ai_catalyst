import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useTodos } from '../hooks/useTodos.js'

vi.mock('../api/todoService.js', () => ({
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}))

import { getTodos, createTodo, updateTodo, deleteTodo } from '../api/todoService.js'

const sampleResponse = {
  todos: [{ id: '1', title: 'Buy milk', completed: false, priority: 'medium' }],
  total: 1,
  page: 1,
  limit: 20,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useTodos', () => {
  it('fetches todos on mount and sets state', async () => {
    getTodos.mockResolvedValue(sampleResponse)

    const { result } = renderHook(() => useTodos())

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.todos).toEqual(sampleResponse.todos)
    expect(result.current.total).toBe(1)
    expect(result.current.error).toBeNull()
  })

  it('sets error state when fetch fails', async () => {
    getTodos.mockRejectedValue(new Error('Unauthorized'))

    const { result } = renderHook(() => useTodos())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Unauthorized')
    expect(result.current.todos).toEqual([])
  })

  it('addTodo prepends new todo to the list', async () => {
    getTodos.mockResolvedValue(sampleResponse)
    const newTodo = { id: '2', title: 'Walk dog', completed: false, priority: 'high' }
    createTodo.mockResolvedValue(newTodo)

    const { result } = renderHook(() => useTodos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addTodo({ title: 'Walk dog', priority: 'high' })
    })

    expect(result.current.todos[0]).toEqual(newTodo)
    expect(result.current.total).toBe(2)
  })

  it('editTodo updates the matching todo in the list', async () => {
    getTodos.mockResolvedValue(sampleResponse)
    const updated = { id: '1', title: 'Buy milk', completed: true, priority: 'medium' }
    updateTodo.mockResolvedValue(updated)

    const { result } = renderHook(() => useTodos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.editTodo('1', { completed: true })
    })

    expect(result.current.todos[0].completed).toBe(true)
  })

  it('removeTodo removes the todo from the list', async () => {
    getTodos.mockResolvedValue(sampleResponse)
    deleteTodo.mockResolvedValue(undefined)

    const { result } = renderHook(() => useTodos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.removeTodo('1')
    })

    expect(result.current.todos).toEqual([])
    expect(result.current.total).toBe(0)
  })

  it('passes status filter to getTodos', async () => {
    getTodos.mockResolvedValue({ todos: [], total: 0, page: 1, limit: 20 })

    const { result } = renderHook(() => useTodos({ status: 'active', page: 1, limit: 20 }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(getTodos).toHaveBeenCalledWith({ status: 'active', page: 1, limit: 20 })
  })
})

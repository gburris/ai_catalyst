import { useState, useEffect, useCallback } from 'react'
import { getTodos, createTodo, updateTodo, deleteTodo } from '../api/todoService.js'

const useTodos = (filters = {}) => {
  const [todos, setTodos] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { page, limit, status } = filters

  const fetchTodos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTodos({ page, limit, status })
      setTodos(data.todos)
      setTotal(data.total)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, limit, status])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const addTodo = async (fields) => {
    const newTodo = await createTodo(fields)
    setTodos((prev) => [newTodo, ...prev])
    setTotal((prev) => prev + 1)
    return newTodo
  }

  const editTodo = async (id, fields) => {
    const updated = await updateTodo(id, fields)
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
    return updated
  }

  const removeTodo = async (id) => {
    await deleteTodo(id)
    setTodos((prev) => prev.filter((t) => t.id !== id))
    setTotal((prev) => prev - 1)
  }

  return { todos, total, loading, error, refetch: fetchTodos, addTodo, editTodo, removeTodo }
}

export { useTodos }

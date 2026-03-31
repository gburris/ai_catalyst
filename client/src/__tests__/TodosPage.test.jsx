import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import TodosPage from '../pages/TodosPage.jsx'

vi.mock('../api/todoService.js', () => ({
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}))

vi.mock('../api/authService.js', () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
}))

import { getTodos, createTodo, deleteTodo, updateTodo } from '../api/todoService.js'

const sampleTodo = { id: '1', title: 'Buy milk', completed: false, priority: 'medium', dueDate: null }

const renderTodosPage = (user = { id: '1', email: 'a@b.com' }) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{ user, authLoading: false, login: vi.fn(), logout: vi.fn(), register: vi.fn() }}
      >
        <TodosPage />
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getTodos.mockResolvedValue({ todos: [sampleTodo], total: 1, page: 1, limit: 20 })
})

describe('TodosPage', () => {
  it('renders the page heading', async () => {
    renderTodosPage()
    expect(screen.getByRole('heading', { name: /my todos/i })).toBeInTheDocument()
    await waitFor(() => screen.getByText('Buy milk'))
  })

  it('renders the todo list after loading', async () => {
    renderTodosPage()
    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeInTheDocument()
    })
  })

  it('creates a new todo on form submit', async () => {
    const user = userEvent.setup()
    const newTodo = { id: '2', title: 'Walk dog', completed: false, priority: 'medium', dueDate: null }
    createTodo.mockResolvedValue(newTodo)
    renderTodosPage()

    await waitFor(() => screen.getByText('Buy milk'))

    await user.type(screen.getByLabelText(/title/i), 'Walk dog')
    await user.click(screen.getByRole('button', { name: /add todo/i }))

    await waitFor(() => {
      expect(createTodo).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Walk dog' })
      )
    })
  })

  it('shows edit form when edit button is clicked', async () => {
    const user = userEvent.setup()
    renderTodosPage()

    await waitFor(() => screen.getByText('Buy milk'))

    await user.click(screen.getByRole('button', { name: /edit/i }))

    expect(screen.getByRole('heading', { name: /edit todo/i })).toBeInTheDocument()
  })

  it('deletes a todo when delete button clicked', async () => {
    const user = userEvent.setup()
    deleteTodo.mockResolvedValue(undefined)
    renderTodosPage()

    await waitFor(() => screen.getByText('Buy milk'))

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(deleteTodo).toHaveBeenCalledWith('1')
  })

  it('toggles complete when checkbox clicked', async () => {
    const user = userEvent.setup()
    updateTodo.mockResolvedValue({ ...sampleTodo, completed: true })
    renderTodosPage()

    await waitFor(() => screen.getByText('Buy milk'))

    await user.click(screen.getByRole('checkbox'))

    await waitFor(() => {
      expect(updateTodo).toHaveBeenCalledWith('1', { completed: true })
    })
  })
})

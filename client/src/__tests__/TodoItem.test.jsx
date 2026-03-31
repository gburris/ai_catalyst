import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoItem from '../components/TodoItem.jsx'

const baseTodo = {
  id: '1',
  title: 'Buy milk',
  completed: false,
  priority: 'medium',
  dueDate: null,
}

describe('TodoItem', () => {
  it('renders the title and priority', () => {
    render(
      <TodoItem
        todo={baseTodo}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    )

    expect(screen.getByText('Buy milk')).toBeInTheDocument()
    expect(screen.getByText('medium')).toBeInTheDocument()
  })

  it('renders due date when provided', () => {
    render(
      <TodoItem
        todo={{ ...baseTodo, dueDate: '2026-04-01' }}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    )

    expect(screen.getByText('2026-04-01')).toBeInTheDocument()
  })

  it('calls onToggleComplete with id and toggled value when checkbox clicked', async () => {
    const user = userEvent.setup()
    const onToggleComplete = vi.fn()

    render(
      <TodoItem
        todo={baseTodo}
        onToggleComplete={onToggleComplete}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    )

    await user.click(screen.getByRole('checkbox'))

    expect(onToggleComplete).toHaveBeenCalledWith('1', true)
  })

  it('calls onDelete with id when delete button clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <TodoItem
        todo={baseTodo}
        onToggleComplete={vi.fn()}
        onDelete={onDelete}
        onEdit={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('calls onEdit with the todo object when edit button clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(
      <TodoItem
        todo={baseTodo}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={onEdit}
      />
    )

    await user.click(screen.getByRole('button', { name: /edit/i }))

    expect(onEdit).toHaveBeenCalledWith(baseTodo)
  })

  it('applies strikethrough class when todo is completed', () => {
    render(
      <TodoItem
        todo={{ ...baseTodo, completed: true }}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    )

    expect(screen.getByText('Buy milk')).toHaveClass('todo-title--strikethrough')
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TodoList from '../components/TodoList.jsx'

const sampleTodos = [
  { id: '1', title: 'Buy milk', completed: false, priority: 'medium', dueDate: null },
  { id: '2', title: 'Walk dog', completed: true, priority: 'high', dueDate: null },
]

describe('TodoList', () => {
  it('renders empty state when todos array is empty', () => {
    render(
      <TodoList
        todos={[]}
        loading={false}
        error={null}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    )

    expect(screen.getByText('No todos yet')).toBeInTheDocument()
  })

  it('renders each todo title', () => {
    render(
      <TodoList
        todos={sampleTodos}
        loading={false}
        error={null}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    )

    expect(screen.getByText('Buy milk')).toBeInTheDocument()
    expect(screen.getByText('Walk dog')).toBeInTheDocument()
  })

  it('shows loading state when loading is true', () => {
    render(
      <TodoList
        todos={[]}
        loading={true}
        error={null}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error message when error is set', () => {
    render(
      <TodoList
        todos={[]}
        loading={false}
        error="Failed to load todos"
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    )

    expect(screen.getByText('Failed to load todos')).toBeInTheDocument()
  })

  it('does not render list items when loading', () => {
    render(
      <TodoList
        todos={sampleTodos}
        loading={true}
        error={null}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    )

    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument()
  })
})

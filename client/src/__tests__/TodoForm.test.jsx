import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoForm from '../components/TodoForm.jsx'

describe('TodoForm', () => {
  it('renders title input, due date, priority select, and submit button', () => {
    render(<TodoForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument()
  })

  it('shows validation error when submitting with empty title', async () => {
    const user = userEvent.setup()
    render(<TodoForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /add todo/i }))

    expect(screen.getByText('Title is required')).toBeInTheDocument()
  })

  it('calls onSubmit with title, dueDate, and priority', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<TodoForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await user.type(screen.getByLabelText(/title/i), 'Buy milk')
    await user.click(screen.getByRole('button', { name: /add todo/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Buy milk',
        dueDate: undefined,
        priority: 'medium',
      })
    })
  })

  it('populates fields in edit mode from initialValues', () => {
    render(
      <TodoForm
        initialValues={{ title: 'Walk dog', dueDate: '2026-04-01', priority: 'high' }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/title/i)).toHaveValue('Walk dog')
    expect(screen.getByLabelText(/due date/i)).toHaveValue('2026-04-01')
    expect(screen.getByLabelText(/priority/i)).toHaveValue('high')
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
  })

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(<TodoForm onSubmit={vi.fn()} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onCancel).toHaveBeenCalled()
  })

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup()
    let resolveSubmit
    const onSubmit = vi.fn(() => new Promise((res) => { resolveSubmit = res }))

    render(<TodoForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await user.type(screen.getByLabelText(/title/i), 'Test')
    await user.click(screen.getByRole('button', { name: /add todo/i }))

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()

    resolveSubmit()
  })
})

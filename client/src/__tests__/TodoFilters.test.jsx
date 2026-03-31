import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoFilters from '../components/TodoFilters.jsx'

describe('TodoFilters', () => {
  it('renders All, Active, and Completed filter buttons', () => {
    render(
      <TodoFilters
        status="all"
        onStatusChange={vi.fn()}
        page={1}
        totalPages={3}
        onPageChange={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /active/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument()
  })

  it('calls onStatusChange with the correct value when a filter is clicked', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()

    render(
      <TodoFilters
        status="all"
        onStatusChange={onStatusChange}
        page={1}
        totalPages={3}
        onPageChange={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /active/i }))
    expect(onStatusChange).toHaveBeenCalledWith('active')

    await user.click(screen.getByRole('button', { name: /completed/i }))
    expect(onStatusChange).toHaveBeenCalledWith('completed')
  })

  it('marks the active filter button with aria-pressed', () => {
    render(
      <TodoFilters
        status="active"
        onStatusChange={vi.fn()}
        page={1}
        totalPages={3}
        onPageChange={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /active/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /all/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onPageChange with page + 1 when Next is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(
      <TodoFilters
        status="all"
        onStatusChange={vi.fn()}
        page={1}
        totalPages={3}
        onPageChange={onPageChange}
      />
    )

    await user.click(screen.getByRole('button', { name: /next page/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables Prev button on the first page', () => {
    render(
      <TodoFilters
        status="all"
        onStatusChange={vi.fn()}
        page={1}
        totalPages={3}
        onPageChange={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
  })

  it('disables Next button on the last page', () => {
    render(
      <TodoFilters
        status="all"
        onStatusChange={vi.fn()}
        page={3}
        totalPages={3}
        onPageChange={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
  })
})

import { useState } from 'react'
import FormField from './FormField.jsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const PRIORITY_OPTIONS = ['low', 'medium', 'high']

function TodoForm({ initialValues, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? '')
  const [priority, setPriority] = useState(initialValues?.priority ?? 'medium')
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const validate = () => {
    const errors = {}
    if (!title.trim()) {
      errors.title = 'Title is required'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        dueDate: dueDate || undefined,
        priority,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Title" id="todo-title" error={fieldErrors.title}>
        <Input
          id="todo-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          disabled={submitting}
        />
      </FormField>

      <FormField label="Due date" id="todo-due-date">
        <Input
          id="todo-due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={submitting}
        />
      </FormField>

      <FormField label="Priority" id="todo-priority">
        <select
          id="todo-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          disabled={submitting}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : initialValues ? 'Save' : 'Add Todo'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export default TodoForm

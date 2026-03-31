import { useState } from 'react'
import NavBar from '../components/NavBar.jsx'
import TodoList from '../components/TodoList.jsx'
import TodoForm from '../components/TodoForm.jsx'
import TodoFilters from '../components/TodoFilters.jsx'
import { useTodos } from '../hooks/useTodos.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const LIMIT = 20

export default function TodosPage() {
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [editingTodo, setEditingTodo] = useState(null)

  const { todos, total, loading, error, addTodo, editTodo, removeTodo } = useTodos({
    status: status === 'all' ? undefined : status,
    page,
    limit: LIMIT,
  })

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    setPage(1)
  }

  const handleCreate = async (fields) => {
    await addTodo(fields)
  }

  const handleEdit = async (fields) => {
    await editTodo(editingTodo.id, fields)
    setEditingTodo(null)
  }

  const handleToggleComplete = async (id, completed) => {
    await editTodo(id, { completed })
  }

  const handleDelete = async (id) => {
    await removeTodo(id)
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">My Todos</h1>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {editingTodo ? 'Edit Todo' : 'Add a Todo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingTodo ? (
              <TodoForm
                initialValues={editingTodo}
                onSubmit={handleEdit}
                onCancel={() => setEditingTodo(null)}
              />
            ) : (
              <TodoForm onSubmit={handleCreate} />
            )}
          </CardContent>
        </Card>

        <TodoFilters
          status={status}
          onStatusChange={handleStatusChange}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        <TodoList
          todos={todos}
          loading={loading}
          error={error}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDelete}
          onEdit={setEditingTodo}
        />
      </main>
    </div>
  )
}

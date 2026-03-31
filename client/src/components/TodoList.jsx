import TodoItem from './TodoItem.jsx'

function TodoList({ todos, loading, error, onToggleComplete, onDelete, onEdit }) {
  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Loading...</p>
  }

  if (error) {
    return <p className="text-center text-destructive py-8">{error}</p>
  }

  if (todos.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No todos yet</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  )
}

export default TodoList

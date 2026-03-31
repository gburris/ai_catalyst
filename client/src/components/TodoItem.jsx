import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function TodoItem({ todo, onToggleComplete, onDelete, onEdit }) {
  const { id, title, completed, priority, dueDate } = todo

  return (
    <li className={cn(
      'flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm transition-all duration-200',
      completed && 'opacity-60'
    )}>
      <Checkbox
        checked={completed}
        onCheckedChange={(checked) => onToggleComplete(id, !!checked)}
        aria-label={`Mark "${title}" as ${completed ? 'incomplete' : 'complete'}`}
      />
      <span className={cn(
        'flex-1 text-sm font-medium todo-title',
        completed && 'line-through text-muted-foreground todo-title--strikethrough'
      )}>
        {title}
      </span>
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <Badge variant={priority}>{priority}</Badge>
        {dueDate && (
          <span className="text-xs text-muted-foreground hidden sm:block">{dueDate}</span>
        )}
        <Button variant="outline" size="sm" onClick={() => onEdit(todo)}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(id)}>
          Delete
        </Button>
      </div>
    </li>
  )
}

export default TodoItem

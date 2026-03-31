import { Button } from '@/components/ui/button'

const STATUS_OPTIONS = ['all', 'active', 'completed']

function TodoFilters({ status, onStatusChange, page, totalPages, onPageChange }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-3">
      <div className="flex gap-1">
        {STATUS_OPTIONS.map((s) => (
          <Button
            key={s}
            variant={status === s ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onStatusChange(s)}
            aria-pressed={status === s}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          Prev
        </Button>
        <span className="text-sm text-muted-foreground min-w-[80px] text-center">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default TodoFilters

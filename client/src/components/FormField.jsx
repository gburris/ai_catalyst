import { Label } from '@/components/ui/label'

function FormField({ label, id, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <span className="text-sm text-destructive">{error}</span>
      )}
    </div>
  )
}

export default FormField

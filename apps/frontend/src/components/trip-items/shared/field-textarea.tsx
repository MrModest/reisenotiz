import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useFormField } from '@/hooks/use-form-field'
import { cn } from '@/lib/utils'

interface FieldTextareaProps {
  name: string
  label: string
  className?: string
  placeholder?: string
}

export function FieldTextarea({ name, label, className, placeholder }: FieldTextareaProps) {
  const { field, error } = useFormField(name)

  return (
    <Field className={cn('gap-1.5', className)}>
      <FieldLabel className='font-mono text-[10px] tracking-[.08em] uppercase text-muted-foreground' htmlFor={name}>{label}</FieldLabel>
      <Textarea aria-invalid={!!error} id={name} placeholder={placeholder} {...field} />
      {error && <FieldError className='text-xs font-thin text-foreground'>{error.message?.toString()}</FieldError>}
    </Field>
  )
}

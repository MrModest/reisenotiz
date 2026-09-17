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
  const errorId = `${name}-error`

  return (
    <Field className={cn('gap-0.5', className)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Textarea
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        id={name}
        placeholder={placeholder}
        {...field}
      />
      {error && (
        <FieldError id={errorId} className='text-xs font-thin text-foreground'>
          {error.message?.toString()}
        </FieldError>
      )}
    </Field>
  )
}

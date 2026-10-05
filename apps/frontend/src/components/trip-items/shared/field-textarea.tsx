import { Field, FieldError } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useFormField } from '@/hooks/use-form-field'
import { cn } from '@/lib/utils'
import { FieldLabel } from './field-label'

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
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <Textarea aria-invalid={!!error} id={name} placeholder={placeholder} {...field} />
      {error && <FieldError className='text-xs font-thin'>{error.message?.toString()}</FieldError>}
    </Field>
  )
}

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useFormField } from '@/hooks/use-form-field'
import { cn } from '@/lib/utils'

interface FieldInputProps {
  name: string
  label: string
  className?: string
};

export function FieldInput({ name, label, className }: FieldInputProps) {
  const { field, error } = useFormField(name)

  return (
    <Field className={cn('gap-0', className)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input aria-invalid={!!error} className='h-fit px-2 rounded-sm' id={name} {...field} />
      {error && <FieldError className='text-xs font-thin text-foreground'>{error.message?.toString()}</FieldError>}
    </Field>
  )
}

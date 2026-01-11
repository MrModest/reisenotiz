import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useController, useFormContext } from 'react-hook-form'

interface FieldInputProps {
  name: string
  label: string
  className?: string
};

export function FieldInput({ name, label, className }: FieldInputProps) {
  const { control } = useFormContext()
  const { field, fieldState: { error } } = useController({ name, control })

  return (
    <Field className={cn('gap-0', className)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input aria-invalid={!!error} className='h-fit px-2 rounded-sm' id={name} {...field} />
      {error && <FieldError className='text-xs font-thin text-foreground'>{error.message?.toString()}</FieldError>}
    </Field>
  )
}

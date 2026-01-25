import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useFormField } from '@/hooks/use-form-field'
import { cn } from '@/lib/utils'

interface FieldInputProps {
  name: string
  label: string
  required?: boolean
  className?: string
};

export function FieldInput({ name, label, required: isRequired = false, className }: FieldInputProps) {
  const { field, error } = useFormField(name)

  return (
    <Field className={cn('gap-0', className)}>
      <FieldLabel className='gap-1' htmlFor={name}>
        {label}
        {isRequired && (<sup className='font-bold -mb-5 text-lg text-red-600'>*</sup>)}
      </FieldLabel>
      <Input aria-invalid={!!error} className='h-fit px-2 rounded-sm' id={name} {...field} />
      {error && <FieldError className='text-xs font-thin'>{error.message?.toString()}</FieldError>}
    </Field>
  )
}

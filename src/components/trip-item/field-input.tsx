import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useFormField } from '@/hooks/use-form-field'
import { cn } from '@/lib/utils'
import { Required } from '@/components/ui/required'

interface FieldInputProps {
  name: string
  label: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  type?: Omit<React.HTMLInputTypeAttribute, 'checkbox' | 'date' | 'datetime-local' | 'radio' | 'submit' | 'time' > // Exclude types that require special handling
}

export function FieldInput({ name, label, required: isRequired = false, disabled, placeholder, className, type }: FieldInputProps) {
  const { field, error } = useFormField(name)

  const isNumber = type === 'number'
  const onChange = isNumber
    ? (e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.valueAsNumber)
    : field.onChange
  const value = isNumber && Number.isNaN(field.value) ? '' : field.value

  return (
    <Field className={cn('gap-0.5', className)}>
      <FieldLabel className='gap-1 pr-10' htmlFor={name}>
        {label}
        {isRequired && (<Required />)}
      </FieldLabel>
      <Input aria-invalid={!!error} id={name} type={type as string} disabled={disabled} placeholder={placeholder} {...field} onChange={onChange} value={value} />
      {error && <FieldError className='text-xs font-thin'>{error.message?.toString()}</FieldError>}
    </Field>
  )
}

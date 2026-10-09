import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useFormField } from '@/hooks/use-form-field'
import { cn } from '@/lib/utils'
import { FieldLabel } from './field-label'

interface FieldInputProps {
  name: string
  label: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  inputClassName?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  // Runs after the form has taken the value
  onValueChange?: (value: string) => void
  type?: Omit<React.HTMLInputTypeAttribute, 'checkbox' | 'date' | 'datetime-local' | 'radio' | 'submit' | 'time'> // Exclude types that require special handling
}

export function FieldInput({
  name,
  label,
  required: isRequired = false,
  disabled,
  placeholder,
  className,
  inputClassName,
  inputMode,
  type,
  onValueChange,
}: FieldInputProps) {
  const { field, error } = useFormField(name)

  const isNumber = type === 'number'
  const onChange = isNumber
    ? (e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.valueAsNumber)
    : (e: React.ChangeEvent<HTMLInputElement>) => {
        field.onChange(e)
        onValueChange?.(e.target.value)
      }
  const value = isNumber && Number.isNaN(field.value) ? '' : field.value

  return (
    <Field className={cn('gap-1.5', className)}>
      <FieldLabel htmlFor={name} required={isRequired}>
        {label}
      </FieldLabel>
      <Input
        aria-invalid={!!error}
        id={name}
        type={type as string}
        inputMode={inputMode}
        className={inputClassName}
        disabled={disabled}
        placeholder={placeholder}
        {...field}
        onChange={onChange}
        value={value}
      />
      {error && <FieldError className='text-xs font-thin'>{error.message?.toString()}</FieldError>}
    </Field>
  )
}

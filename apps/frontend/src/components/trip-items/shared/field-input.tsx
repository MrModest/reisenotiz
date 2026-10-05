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
      <FieldLabel className='gap-1 pr-10 font-mono text-[10px] tracking-[.08em] uppercase text-muted-foreground' htmlFor={name}>
        {label}
        {isRequired && <Required />}
      </FieldLabel>
      <Input
        aria-invalid={!!error}
        id={name}
        type={type as string}
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

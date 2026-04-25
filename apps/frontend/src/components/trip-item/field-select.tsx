import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { inputStyles } from '@/components/ui/input-styles'
import { useFormField } from '@/hooks/use-form-field'
import { cn } from '@/lib/utils'
import { Required } from '@/components/ui/required'

interface FieldSelectProps {
  name: string
  label: string
  options: readonly { value: string; label: string }[]
  required?: boolean
  disabled?: boolean
  className?: string
}

export function FieldSelect({
  name,
  label,
  options,
  required: isRequired = false,
  disabled,
  className,
}: FieldSelectProps) {
  const { field, error } = useFormField(name)

  return (
    <Field className={cn('gap-0.5', className)}>
      <FieldLabel className='gap-1 pr-10' htmlFor={name}>
        {label}
        {isRequired && <Required />}
      </FieldLabel>
      <select aria-invalid={!!error} id={name} disabled={disabled} className={cn(...inputStyles)} {...field}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <FieldError className='text-xs font-thin'>{error.message?.toString()}</FieldError>}
    </Field>
  )
}

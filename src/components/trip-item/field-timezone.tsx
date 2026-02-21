import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { useFormField } from '@/hooks/use-form-field'
import { cn } from '@/lib/utils'
import { Required } from '@/components/ui/required'
import { TimezoneSelector } from '@/components/ui/combobox/timezone'

interface FieldTimezoneProps {
  name: string
  label: string
  required?: boolean
  className?: string
}

export function FieldTimezone({ name, label, required: isRequired = false, className }: FieldTimezoneProps) {
  const { field, error } = useFormField(name)

  return (
    <Field className={cn('gap-0.5', className)}>
      <FieldLabel className='gap-1 pr-10' htmlFor={name}>
        {label}
        {isRequired && (<Required />)}
      </FieldLabel>
      <TimezoneSelector
        selected={field.value}
        onSelect={(val) => field.onChange(val ?? '')}
      />
      {error && <FieldError className='text-xs font-thin'>{error.message?.toString()}</FieldError>}
    </Field>
  )
}

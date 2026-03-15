import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { useFormField } from '@/hooks/use-form-field'
import { cn } from '@/lib/utils'
import { Required } from '@/components/ui/required'
import { TimezoneSelector } from '@/components/ui/combobox/timezone'
import { TZ } from '@/lib/datetime'

interface FieldTimezoneProps {
  name: string
  label: string
  required?: boolean
  className?: string
}

export function FieldTimezone({ name, label, required: isRequired = false, className }: FieldTimezoneProps) {
  const { field, error, isDirty } = useFormField(name)

  const preSelected = field.value || isDirty
    ? field.value
    : TZ.local()

  return (
    <Field className={cn('gap-0.5', className)}>
      <FieldLabel className='gap-1 pr-10' htmlFor={name}>
        {label}
        {isRequired && (<Required />)}
      </FieldLabel>
      <TimezoneSelector
        selected={preSelected}
        onSelect={(val) => field.onChange(val ?? '')}
      />
      {error && <FieldError className='text-xs font-thin'>{error.message?.toString()}</FieldError>}
    </Field>
  )
}

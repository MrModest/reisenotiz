import { useState } from 'react'
import { Field, FieldError } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useFormField } from '@/hooks/use-form-field'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/icon'
import { FieldLabel } from './field-label'

interface FieldDatePickerProps {
  name: string
  label: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function FieldDatePicker({
  name,
  label,
  required: isRequired = false,
  disabled,
  placeholder = 'Pick a date',
  className,
}: FieldDatePickerProps) {
  const { field, error } = useFormField(name)
  const [open, setOpen] = useState(false)

  const selectedDate = field.value ? parseDate(field.value) : undefined

  function handleSelect(date: Date | undefined) {
    if (date) {
      const formatted = formatDateForInput(date)
      field.onChange(formatted)
      setOpen(false)
    }
  }

  return (
    <Field className={cn('gap-1.5', className)}>
      <FieldLabel htmlFor={name} required={isRequired}>
        {label}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant='outline'
              className={cn(
                'justify-between items-center gap-2 text-left font-mono font-normal w-full h-auto py-1.5 text-sm',
                !field.value && 'text-muted-foreground',
                error && 'border-destructive',
              )}
              id={name}
              disabled={disabled}
            />
          }
        >
          <span>{field.value || placeholder}</span>
          <Icon name='calendar' />
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          <Calendar mode='single' selected={selectedDate} onSelect={handleSelect} disabled={disabled} />
        </PopoverContent>
      </Popover>
      {error && <FieldError className='text-xs font-thin'>{error.message?.toString()}</FieldError>}
    </Field>
  )
}

function parseDate(dateString: string): Date | undefined {
  if (!dateString) return undefined
  const [year, month, day] = dateString.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

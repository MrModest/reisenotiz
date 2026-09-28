import { useState, useEffect, useRef } from 'react'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useFormField } from '@/hooks/use-form-field'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/icon'
import { Required } from '@/components/ui/required'

interface FieldTimePickerProps {
  name: string
  label: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

export function FieldTimePicker({
  name,
  label,
  required: isRequired = false,
  disabled,
  placeholder = 'Pick a time',
  className,
}: FieldTimePickerProps) {
  const { field, error } = useFormField(name)
  const [open, setOpen] = useState(false)

  const [hours, minutes] = field.value ? field.value.split(':') : ['12', '00']

  function handleTimeChange(newHours: string, newMinutes: string) {
    field.onChange(`${newHours}:${newMinutes}`)
  }

  return (
    <Field className={cn('gap-0.5', className)}>
      <FieldLabel className='gap-1 pr-10' htmlFor={name}>
        {label}
        {isRequired && <Required />}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant='outline'
              className={cn(
                'justify-between items-center gap-2 text-left font-normal w-full h-auto py-1.5 md:py-1 text-sm',
                !field.value && 'text-muted-foreground',
                error && 'border-destructive',
              )}
              disabled={disabled}
            />
          }
        >
          <span>{field.value || placeholder}</span>
          <Icon name='time' />
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          <div className='flex gap-0'>
            <TimeColumn value={hours} options={HOURS} onChange={(h) => handleTimeChange(h, minutes)} label='Hours' />
            <div className='w-px bg-border' />
            <TimeColumn
              value={minutes}
              options={MINUTES}
              onChange={(m) => handleTimeChange(hours, m)}
              label='Minutes'
            />
          </div>
        </PopoverContent>
      </Popover>
      {error && <FieldError className='text-xs font-thin'>{error.message?.toString()}</FieldError>}
    </Field>
  )
}

function TimeColumn({
  value,
  options,
  onChange,
  label,
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
  label: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current
      const selected = selectedRef.current
      const containerHeight = container.clientHeight
      const selectedTop = selected.offsetTop
      const selectedHeight = selected.clientHeight

      container.scrollTop = selectedTop - containerHeight / 2 + selectedHeight / 2
    }
  }, [value])

  return (
    <div className='flex flex-col w-16'>
      <div className='text-xs text-muted-foreground font-medium text-center py-2'>{label}</div>
      <div
        ref={containerRef}
        className='h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent'
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--border)) transparent',
        }}
      >
        {options.map((option) => (
          <button
            key={option}
            ref={option === value ? selectedRef : null}
            type='button'
            onClick={() => onChange(option)}
            className={cn(
              'w-full px-2 py-2 text-center text-sm hover:bg-muted transition-colors',
              option === value && 'bg-primary text-primary-foreground font-medium',
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

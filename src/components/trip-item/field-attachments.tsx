import { Field, FieldSet } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icon'
import { cn } from '@/lib/utils'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { FieldInput } from './field-input'
import { generateUUID } from '@/types'

interface FieldAttachmentsProps {
  name: string
  tripItemId: string
  className?: string
}

export function FieldAttachments({ name, tripItemId, className }: FieldAttachmentsProps) {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <Field className={cn('gap-2', className)}>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => append({ id: generateUUID(), tripItemId, name: '', link: '', note: '' })}
        className='w-full'
      >
        <Icon name='add' className='h-4 w-4 mr-2' />
        Add Attachment
      </Button>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
        {fields.map((field, index) => (
          <FieldSet key={field.id} className='gap-2 p-3 border border-input rounded-md'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Attachment {index + 1}</span>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => remove(index)}
                className='h-7 w-7 p-0'
              >
                <Icon name='close' className='h-4 w-4' />
              </Button>
            </div>
            <FieldInput required name={`${name}.${index}.name`} label='Name' />
            <FieldInput required name={`${name}.${index}.link`} label='Link/URL' />
            <FieldInput name={`${name}.${index}.note`} label='Note' />
          </FieldSet>
        ))}
      </div>
    </Field>
  )
}

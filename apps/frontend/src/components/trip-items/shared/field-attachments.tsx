import { useFieldArray, useFormContext } from 'react-hook-form'
import { Icon } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldSet } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/types'
import { FieldInput } from './field-input'

export function FieldAttachments({ name, className }: { name: string; className?: string }) {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <Field className={cn('gap-2', className)}>
      <Button type='button' variant='outline' size='sm' className='w-full' onClick={() => append({ id: generateUUID(), name: '', link: '', note: '' })}>
        <Icon name='add' className='mr-2 h-4 w-4' />
        Add Attachment
      </Button>
      <div className='grid grid-cols-1 gap-2'>
        {fields.map((field, index) => (
          <FieldSet key={field.id} className='gap-2 rounded-md border border-input p-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Attachment {index + 1}</span>
              <Button type='button' variant='ghost' size='sm' aria-label={`Remove attachment ${index + 1}`} className='h-7 w-7 p-0' onClick={() => remove(index)}>
                <Icon name='close' className='h-4 w-4' />
              </Button>
            </div>
            <FieldGroup className='grid grid-cols-1 gap-2'>
              <FieldInput required name={`${name}.${index}.name`} label='Name' />
              <FieldInput required name={`${name}.${index}.link`} label='Link/URL' />
              <FieldInput name={`${name}.${index}.note`} label='Note' />
            </FieldGroup>
          </FieldSet>
        ))}
      </div>
    </Field>
  )
}

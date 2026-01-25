import { FieldInput } from './field-input'
import { FieldArrayList } from './field-array-list'
import { generateUUID } from '@/types'
import { FieldGroup } from '../ui/field'

interface FieldAttachmentsProps {
  name: string
  tripItemId: string
  className?: string
}

export function FieldAttachments({ name, tripItemId, className }: FieldAttachmentsProps) {
  return (
    <FieldArrayList
      name={name}
      addButtonLabel='Add Attachment'
      itemLabel='Attachment'
      onAdd={() => ({ id: generateUUID(), tripItemId, name: '', link: '', note: '' })}
      className={className}
    >
      {(index, name) => (
        <FieldGroup className='grid grid-cols-1 gap-2'>
          <FieldInput required name={`${name}.${index}.name`} label='Name' />
          <FieldInput required name={`${name}.${index}.link`} label='Link/URL' />
          <FieldInput name={`${name}.${index}.note`} label='Note' />
        </FieldGroup>
      )}
    </FieldArrayList>
  )
}

import { FieldInput } from './field-input'
import { FieldArrayList } from './field-array-list'
import { generateUUID } from '@/types'

interface FieldPassengersProps {
  name: string
  className?: string
}

export function FieldPassengers({ name, className }: FieldPassengersProps) {
  return (
    <FieldArrayList
      name={name}
      addButtonLabel='Add Passenger'
      itemLabel='Passenger'
      onAdd={() => ({ id: generateUUID(), fullname: '', contacts: [] })}
      className={className}
    >
      {(index, name) => (
        <FieldInput required name={`${name}.${index}.fullname`} label='Full Name' />
      )}
    </FieldArrayList>
  )
}

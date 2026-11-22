import { FieldInput } from '@/components/trip-items/shared/field-input'
import { countryDictionary } from '@/services'
import { FieldSelect } from './field-select'
import { FieldTimezone } from './field-timezone'
import type { PlaceFieldsProps } from './module'

const countryOptions = () => [
  { value: '', label: 'Select a country' },
  ...countryDictionary
    .getAllValues()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((country) => ({ value: country.code, label: country.name })),
]

export function PlaceFields({ prefix = '' }: PlaceFieldsProps) {
  return (
    <>
      <FieldInput name={`${prefix}name`} label='Name' required />
      <FieldInput name={`${prefix}address.line`} label='Address' />
      <div className='grid grid-cols-2 gap-3'>
        <FieldInput name={`${prefix}address.city`} label='City' required />
        <FieldSelect name={`${prefix}address.countryCode`} label='Country' options={countryOptions()} required />
      </div>
      <FieldTimezone name={`${prefix}tzone`} label='Timezone' required />
    </>
  )
}

import { FieldInput } from '@/components/trip-items/shared/field-input'
import { countryDictionary } from '@/services'
import { FieldSelect } from './field-select'
import { FieldTimezone } from './field-timezone'

const countryOptions = () => [
  { value: '', label: 'Select a country' },
  ...countryDictionary
    .getAllValues()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((country) => ({ value: country.code, label: country.name })),
]

export function PlaceFields() {
  return (
    <>
      <FieldInput name='name' label='Name' required />
      <FieldInput name='address.line' label='Address' />
      <div className='grid grid-cols-2 gap-3'>
        <FieldInput name='address.city' label='City' required />
        <FieldSelect name='address.countryCode' label='Country' options={countryOptions()} required />
      </div>
      <FieldTimezone name='tzone' label='Timezone' required />
    </>
  )
}

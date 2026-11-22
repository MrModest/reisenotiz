/* eslint-disable react-refresh/only-export-components -- the module object and its fields component belong together */
import { useFormContext } from 'react-hook-form'
import { FieldInput } from '@/components/trip-items/shared/field-input'
import { TZ } from '@/lib/datetime'
import { airportDictionary } from '@/services'
import type { Airport } from '@/types'
import type { PlaceFieldsProps, PlaceTypeModule } from './module'
import { PlaceFields } from './place-fields'
import { airportSchema } from './schema'

// A code the dictionary knows prefills the rest, and the traveller corrects what is wrong. The
// place stays the one being typed in: it does not become the dictionary's airport.
function AirportFields({ prefix = '' }: PlaceFieldsProps) {
  const { setValue } = useFormContext()

  function prefill(code: string) {
    const known = airportDictionary.get(code.toUpperCase())
    if (!known) return
    const options = { shouldDirty: true, shouldValidate: true }
    setValue(`${prefix}name`, known.name, options)
    setValue(`${prefix}address`, known.address, options)
    setValue(`${prefix}tzone`, known.tzone, options)
  }

  return (
    <>
      <FieldInput name={`${prefix}code`} label='Code' placeholder='IATA' required onValueChange={prefill} />
      <PlaceFields prefix={prefix} />
    </>
  )
}

export const airportModule: PlaceTypeModule<Airport> = {
  type: 'Airport',
  label: 'Airport',
  icon: 'flight',
  empty: () => ({ id: '', type: 'Airport', code: '', name: '', address: { countryCode: '', city: '', line: '' }, tzone: TZ.local() }),
  meta: (airport) => airport.code,
  schema: airportSchema,
  Fields: AirportFields,
}

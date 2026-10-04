import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldInput } from '@/components/trip-items/shared/field-input'
import { TZ } from '@/lib/datetime'
import { airportDictionary } from '@/services'
import type { Airport } from '@/types'
import { formatAddress } from './format'
import { PlaceFields } from './place-fields'
import { PlaceForm } from './place-form'
import type { PlaceFormProps } from './module'
import { SavedPlaceRow } from './saved-place-row'
import { airportSchema } from './schema'

export function AirportRow({ place }: { place: Airport }) {
  return <SavedPlaceRow name={place.name} meta={place.code} address={formatAddress(place.address)} />
}

const emptyAirport: Airport = { code: '', name: '', address: { countryCode: '', city: '', line: '' }, tzone: TZ.local() }

// The code is the saved airport's key, so it is typed once and fixed after that
export function AirportForm({ place, takenKeys, onSubmit, onCancel }: PlaceFormProps<Airport>) {
  const form = useForm<Airport>({
    resolver: zodResolver(airportSchema),
    defaultValues: place ?? emptyAirport,
    mode: 'onTouched',
  })

  // A code the dictionary knows prefills the rest; the traveller corrects what is wrong
  function prefill(code: string) {
    const known = airportDictionary.get(code.toUpperCase())
    if (!known) return
    form.setValue('name', known.name, { shouldDirty: true, shouldValidate: true })
    form.setValue('address', known.address, { shouldDirty: true, shouldValidate: true })
    form.setValue('tzone', known.tzone, { shouldDirty: true, shouldValidate: true })
  }

  // Adding never edits: a code already saved is refused rather than overwritten
  function handleSubmit(airport: Airport) {
    if (!place && takenKeys.includes(airport.code)) {
      form.setError('code', { message: `${airport.code} is already saved` })
      return
    }
    onSubmit(airport)
  }

  return (
    <PlaceForm form={form} onSubmit={handleSubmit} onCancel={onCancel}>
      <FieldInput name='code' label='Code' placeholder='IATA' required disabled={!!place} onValueChange={prefill} />
      <PlaceFields />
    </PlaceForm>
  )
}

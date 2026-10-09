import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldInput } from '@/components/trip-items/shared/field-input'
import { TZ } from '@/lib/datetime'
import { ACCOMMODATION_SITE_KINDS, type AccommodationSite } from '@/types'
import { FieldSelect } from './field-select'
import { formatAddress } from '@/lib/utils/format-address'
import { PlaceFields } from './place-fields'
import { PlaceForm } from './place-form'
import type { PlaceFormProps } from './module'
import { SavedPlaceRow } from './saved-place-row'
import { accommodationSiteSchema } from './schema'

const kindLabels: Record<AccommodationSite['kind'], string> = {
  Hotel: 'Hotel',
  Hostel: 'Hostel',
  Apartment: 'Apartment',
  Guesthouse: 'Guesthouse',
  BnB: 'Bed & Breakfast',
  Resort: 'Resort',
  Other: 'Other',
}

const kindOptions = ACCOMMODATION_SITE_KINDS.map((kind) => ({ value: kind, label: kindLabels[kind] }))

export function AccommodationSiteRow({ place }: { place: AccommodationSite }) {
  return <SavedPlaceRow name={place.name} meta={place.kind} address={formatAddress(place.address)} />
}

const emptySite: AccommodationSite = {
  name: '',
  kind: 'Hotel',
  address: { countryCode: '', city: '', line: '' },
  contact: '',
  tzone: TZ.local(),
}

export function AccommodationSiteForm({ place, onSubmit, onCancel }: PlaceFormProps<AccommodationSite>) {
  const form = useForm<AccommodationSite>({
    resolver: zodResolver(accommodationSiteSchema),
    defaultValues: place ? { ...place, contact: place.contact ?? '' } : emptySite,
    mode: 'onTouched',
  })

  return (
    <PlaceForm form={form} onSubmit={onSubmit} onCancel={onCancel}>
      <PlaceFields />
      <div className='grid grid-cols-2 gap-3'>
        <FieldSelect name='kind' label='Kind' options={kindOptions} />
        <FieldInput name='contact' label='Contact' />
      </div>
    </PlaceForm>
  )
}

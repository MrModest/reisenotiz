/* eslint-disable react-refresh/only-export-components -- the module object and its fields component belong together */
import { FieldInput } from '@/components/trip-items/shared/field-input'
import { TZ } from '@/lib/datetime'
import { ACCOMMODATION_SITE_KINDS, type AccommodationSite } from '@/types'
import { FieldSelect } from './field-select'
import type { PlaceFieldsProps, PlaceTypeModule } from './module'
import { PlaceFields } from './place-fields'
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

function AccommodationSiteFields({ prefix = '' }: PlaceFieldsProps) {
  return (
    <>
      <PlaceFields prefix={prefix} />
      <div className='grid grid-cols-2 gap-3'>
        <FieldSelect name={`${prefix}kind`} label='Kind' options={kindOptions} />
        <FieldInput name={`${prefix}contact`} label='Contact' />
      </div>
    </>
  )
}

export const accommodationSiteModule: PlaceTypeModule<AccommodationSite> = {
  type: 'AccommodationSite',
  label: 'Accommodation',
  icon: 'accommodation',
  empty: () => ({
    id: '',
    type: 'AccommodationSite',
    name: '',
    kind: 'Hotel',
    address: { countryCode: '', city: '', line: '' },
    contact: '',
    tzone: TZ.local(),
  }),
  meta: (site) => kindLabels[site.kind],
  schema: accommodationSiteSchema,
  Fields: AccommodationSiteFields,
}

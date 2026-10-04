import type { PlaceType, PlaceTypes } from '@/types'
import type { PlaceTypeModule } from './module'
import { AccommodationSiteForm, AccommodationSiteRow } from './accommodation-site'
import { AirportForm, AirportRow } from './airport'

const registry: { [K in PlaceType]: PlaceTypeModule<PlaceTypes[K]> } = {
  Airport: { type: 'Airport', label: 'Airport', icon: 'flight', Row: AirportRow, Form: AirportForm },
  AccommodationSite: {
    type: 'AccommodationSite',
    label: 'Accommodation',
    icon: 'accommodation',
    Row: AccommodationSiteRow,
    Form: AccommodationSiteForm,
  },
}

// In display order: the Places screen's chips follow it
export const placeTypeModules = Object.values(registry) as unknown as PlaceTypeModule[]

export function getPlaceTypeModule<T extends PlaceType>(type: T): PlaceTypeModule<PlaceTypes[T]> {
  return registry[type] as unknown as PlaceTypeModule<PlaceTypes[T]>
}

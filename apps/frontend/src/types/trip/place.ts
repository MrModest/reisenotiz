import { generateUUID } from '@/types/common/uuid'
import { Address } from './address'

export interface Place {
  // Where the place came from: a provider's id (`iata:BER`), or `custom:<uuid>` when typed in by hand.
  // Empty on a place being typed in that has not been saved yet
  id: string
  type: PlaceType
  name: string
  address: Address
  tzone: string
}

export interface Airport extends Place {
  type: 'Airport'
  code: string
}

export const ACCOMMODATION_SITE_KINDS = [
  'Hotel',
  'Hostel',
  'Apartment',
  'Guesthouse',
  'BnB',
  'Resort',
  'Other',
] as const

export type AccommodationSiteKind = (typeof ACCOMMODATION_SITE_KINDS)[number]

export interface AccommodationSite extends Place {
  type: 'AccommodationSite'
  kind: AccommodationSiteKind
  contact?: string
}

export interface PlaceTypes {
  Airport: Airport
  AccommodationSite: AccommodationSite
}

export type PlaceType = keyof PlaceTypes

export type AnyPlace = PlaceTypes[PlaceType]

const CUSTOM_PREFIX = 'custom:'

export function customPlaceId(): string {
  return `${CUSTOM_PREFIX}${generateUUID()}`
}

export function isCustomPlace(place: Place): boolean {
  return place.id.startsWith(CUSTOM_PREFIX)
}

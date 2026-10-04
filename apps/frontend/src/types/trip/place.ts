import { Address } from './address'

export interface Place {
  name: string
  address: Address
  tzone: string
}

export interface Airport extends Place {
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
  kind: AccommodationSiteKind
  contact?: string
}

export type SavedPlace<T extends Place> = T & { archived?: boolean }

export interface PlaceTypes {
  Airport: Airport
  AccommodationSite: AccommodationSite
}

export type PlaceType = keyof PlaceTypes

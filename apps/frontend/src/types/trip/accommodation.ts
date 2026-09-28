import type { ZonedInstant } from '@/types/common'
import { TripItem } from './trip-item'
import { Address } from './address'

export interface StayInterval {
  in: ZonedInstant
  out: ZonedInstant
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

export interface AccommodationSite {
  id?: string
  name: string
  kind: AccommodationSiteKind
  address: Address
  contact?: string
  tzone: string
}

export interface Accommodation extends TripItem {
  type: 'Accommodation'
  site: AccommodationSite
  reservedOn?: string // TODO: migrate to `Person`
  guests: number // TODO: migrate to `Person[]`
  rooms: number
  stayInterval: {
    provided: StayInterval
    planned?: StayInterval
  }
}

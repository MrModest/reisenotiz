import type { ZonedInstant } from '@/types/common'
import { Person } from './person'
import { TripItem } from './trip-item'

export interface StayInterval {
  in: ZonedInstant
  out: ZonedInstant
}

export interface Accommodation extends TripItem {
  type: 'Accommodation'
  // The saved site's uuid, which is its key in `savedAccommodationSites`
  placeKey: string
  reservedOn?: Person
  guests: Person[]
  rooms: number
  stayInterval: {
    provided: StayInterval
    planned?: StayInterval
  }
}

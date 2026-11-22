import type { ZonedInstant } from '@/types/common'
import type { AccommodationSite } from './place'
import { Person } from './person'
import { TripItem } from './trip-item'

export interface StayInterval {
  in: ZonedInstant
  out: ZonedInstant
}

export interface Accommodation extends TripItem {
  type: 'Accommodation'
  place: AccommodationSite
  reservedOn?: Person
  guests: Person[]
  rooms: number
  stayInterval: {
    provided: StayInterval
    planned?: StayInterval
  }
}

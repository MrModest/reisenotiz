import type { ZonedInstant } from '@/types/common'
import { TripItem } from './trip-item'
import { AccommodationSite } from './place'

export interface StayInterval {
  in: ZonedInstant
  out: ZonedInstant
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

import type { AutomergeUrl } from '@automerge/react'
import type { Trip, TripItem, Airport } from '@/types'
import type { AccommodationSiteRecord } from '@/store/user-records/accommodations'

export interface RootDoc {
  tripIndex: Record<string, AutomergeUrl>
  userAirports: Record<string, Airport>
  userAccommodations: Record<string, AccommodationSiteRecord>
}

export interface TripDoc {
  trip: Trip
  tripItems: Record<string, TripItem>
}

export const EMPTY_ROOT_DOC: RootDoc = {
  tripIndex: {},
  userAirports: {},
  userAccommodations: {},
}

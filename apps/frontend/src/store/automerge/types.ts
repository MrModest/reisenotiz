import type { AutomergeUrl } from '@automerge/react'
import type { Trip, TripItem, Airport, AccommodationSite, SavedPlace } from '@/types'

export interface RootDoc {
  tripIndex: Record<string, AutomergeUrl>
  // Both absent from a root document made before saved places existed; there is no migration.
  // Keyed by IATA code
  savedAirports?: Record<string, SavedPlace<Airport>>
  // Keyed by uuid
  savedAccommodationSites?: Record<string, SavedPlace<AccommodationSite>>
}

export interface TripDoc {
  trip: Trip
  tripItems: Record<string, TripItem>
}

export const EMPTY_ROOT_DOC: RootDoc = {
  tripIndex: {},
  savedAirports: {},
  savedAccommodationSites: {},
}

import type { AutomergeUrl } from '@automerge/react'
import type { Trip, TripItem, AnyPlace } from '@/types'

export interface RootDoc {
  tripIndex: Record<string, AutomergeUrl>
  // Custom places only, each under its own `id`
  savedPlaces: Record<string, AnyPlace>
}

export interface TripDoc {
  trip: Trip
  tripItems: Record<string, TripItem>
}

export const EMPTY_ROOT_DOC: RootDoc = {
  tripIndex: {},
  savedPlaces: {},
}

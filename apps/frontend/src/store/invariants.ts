import { DateTime } from '@/lib/datetime'
import type { Accommodation, StayInterval, TripItem } from '@/types'
import { findSavedPlace, type SavedPlaceEntry } from './saved-places'

const isBefore = (a: StayInterval['in'], b: StayInterval['in']) => DateTime.from(a).isBefore(DateTime.from(b))

function stayViolation({ placeKey, stayInterval: { provided, planned } }: Accommodation, places: SavedPlaceEntry[]): string | undefined {
  if (!findSavedPlace(places, 'AccommodationSite', placeKey)) return 'the property is not a saved site'
  if (isBefore(provided.out, provided.in)) return 'check-out is before check-in'
  if (!planned) return undefined
  if (isBefore(planned.out, planned.in)) return 'the plan leaves before it arrives'
  if (isBefore(planned.in, provided.in) || isBefore(provided.out, planned.out)) return 'the plan lies outside the booking'
}

export function assertValidTripItem(item: Omit<TripItem, 'id'>, places: SavedPlaceEntry[]): void {
  const violation = item.type === 'Accommodation' ? stayViolation(item as Accommodation, places) : undefined
  if (violation) throw new Error(`Invalid ${item.type}: ${violation}`)
}

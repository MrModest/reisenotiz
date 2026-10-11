import { DateTime } from '@/lib/datetime'
import type { Accommodation, StayInterval, TripItem } from '@/types'
import { findSavedPlace, type SavedPlaceEntry } from './saved-places'

export type StayIntervalIssue = { interval: 'provided' | 'planned'; end: 'in' | 'out'; message: string }

const isBefore = (a: StayInterval['in'], b: StayInterval['in']) => DateTime.from(a).isBefore(DateTime.from(b))

// The rules a stay's intervals keep, compared as instants: the form shows each one at its field
export function stayIntervalIssues({ provided, planned }: Accommodation['stayInterval']): StayIntervalIssue[] {
  const issues: StayIntervalIssue[] = []
  const add = (interval: StayIntervalIssue['interval'], end: StayIntervalIssue['end'], message: string) => issues.push({ interval, end, message })
  if (isBefore(provided.out, provided.in)) add('provided', 'out', 'Check-out is before check-in')
  if (planned) {
    if (isBefore(planned.in, provided.in)) add('planned', 'in', 'You arrive before check-in')
    if (isBefore(provided.out, planned.out)) add('planned', 'out', 'You leave after check-out')
    if (isBefore(planned.out, planned.in)) add('planned', 'out', 'You leave before you arrive')
  }
  return issues
}

function stayViolation(stay: Accommodation, places: SavedPlaceEntry[]): string | undefined {
  if (!findSavedPlace(places, 'AccommodationSite', stay.placeKey)) return 'the property is not a saved site'
  return stayIntervalIssues(stay.stayInterval)[0]?.message
}

export function assertValidTripItem(item: Omit<TripItem, 'id'>, places: SavedPlaceEntry[]): void {
  const violation = item.type === 'Accommodation' ? stayViolation(item as Accommodation, places) : undefined
  if (violation) throw new Error(`Invalid ${item.type}: ${violation}`)
}

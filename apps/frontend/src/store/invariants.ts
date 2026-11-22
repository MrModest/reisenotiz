import { DateTime } from '@/lib/datetime'
import type { Accommodation, StayInterval, TripItem } from '@/types'
import { placesOf } from './saved-places'

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

function violation(item: Omit<TripItem, 'id'>): string | undefined {
  // The form gives a typed-in place its custom id on submit, so an empty one is a bug
  if (placesOf(item).some((place) => !place.id)) return 'a place has no id'
  if (item.type === 'Accommodation') return stayIntervalIssues((item as Accommodation).stayInterval)[0]?.message
}

export function assertValidTripItem(item: Omit<TripItem, 'id'>): void {
  const found = violation(item)
  if (found) throw new Error(`Invalid ${item.type}: ${found}`)
}

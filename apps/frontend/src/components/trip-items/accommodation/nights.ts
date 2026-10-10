import { DateTime, type ZonedInstant } from '@/lib/datetime'
import type { StayInterval } from '@/types'

// A date as midnight UTC, so calendar arithmetic compares days. Each end is read in its own zone.
const dateOf = (at: ZonedInstant) => {
  const dt = DateTime.from(at)
  return DateTime.fromObject({ year: dt.year, month: dt.month, day: dt.day }, 'UTC')
}

/** Nights paid for: the calendar dates from check-in to check-out. Never derived from the plan. */
export function countNights(provided: StayInterval): number {
  return dateOf(provided.out).daysSince(dateOf(provided.in))
}

import { DateTime } from '@/lib/datetime'
import type { StayInterval } from '@/types'

/** Nights paid for: the calendar dates from check-in to check-out in the stay's zone. Never derived from the plan. */
export function countNights(provided: StayInterval): number {
  return DateTime.from(provided.out).calendarDaysSince(DateTime.from(provided.in))
}

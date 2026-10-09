import { DateTime, formatTo, type ZonedInstant } from '@/lib/datetime'
import type { Accommodation, StayInterval } from '@/types'

// A date as midnight UTC, so calendar arithmetic compares days. Each end is read in its own zone.
const dateOf = (at: ZonedInstant) => {
  const dt = DateTime.from(at)
  return DateTime.fromObject({ year: dt.year, month: dt.month, day: dt.day }, 'UTC')
}

const daysBetween = (earlier: ZonedInstant, later: ZonedInstant) => dateOf(later).daysSince(dateOf(earlier))

const unused = (nights: number) => `${nights} paid ${nights === 1 ? 'night' : 'nights'} unused`

/** Nights paid for: the calendar dates from check-in to check-out. Never derived from the plan. */
export function countNights(provided: StayInterval): number {
  return daysBetween(provided.in, provided.out)
}

/** `Arriving 6 Sep · 1 paid night unused` when the plan starts or ends on another day than the booking. */
export function unusedNightNote({ provided, planned }: Accommodation['stayInterval']): string | undefined {
  if (!planned) return undefined
  const late = daysBetween(provided.in, planned.in)
  const early = daysBetween(planned.out, provided.out)
  const notes = [
    late > 0 && `Arriving ${formatTo.dayMonth(planned.in)} · ${unused(late)}`,
    early > 0 && `Leaving ${formatTo.dayMonth(planned.out)} · ${unused(early)}`,
  ].filter(Boolean)
  return notes.length ? notes.join(' · ') : undefined
}

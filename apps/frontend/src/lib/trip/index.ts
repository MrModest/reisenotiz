import { DateTime } from '@/lib/datetime'
import type { Trip } from '@/types'

/**
 * Facts about a trip derived from its dates. Each takes `now` as an argument and never reads the
 * clock, so a caller that re-renders with a fresh `now` (see `useNow`) always reads the present.
 *
 * A trip's days are calendar dates in the trip's start zone. It becomes ongoing at its start
 * instant and completes when the reader's date in that zone passes its last day.
 */

export type TripStatus = 'upcoming' | 'ongoing' | 'completed'

export interface TripSummary {
  trip: Trip
  itemCount: number
}

export interface TripGroup {
  label: string
  count?: number
  trips: TripSummary[]
}

// A date as midnight in the trip's start zone, so calendar arithmetic compares days.
// Each end is read in its own zone; `now` is read in the start zone.
function day(trip: Trip, dt: DateTime) {
  return DateTime.fromObject({ year: dt.year, month: dt.month, day: dt.day }, trip.startDate.zone)
}
const startDay = (trip: Trip) => day(trip, DateTime.from(trip.startDate))
const endDay = (trip: Trip) => day(trip, DateTime.from(trip.endDate))
const today = (trip: Trip, now: DateTime) => day(trip, now.toZone(trip.startDate.zone))

export function getTripStatus(trip: Trip, now: DateTime): TripStatus {
  if (now.isBefore(DateTime.from(trip.startDate))) return 'upcoming'
  return today(trip, now).isAfter(endDay(trip)) ? 'completed' : 'ongoing'
}

export function getTripDuration(trip: Trip): number {
  return endDay(trip).calendarDiff(startDay(trip)).days + 1
}

export function getTripDayIndex(trip: Trip, now: DateTime): number {
  return today(trip, now).calendarDiff(startDay(trip)).days + 1
}

/** `In 1 day`, `In 3 months`, `In 1 year`, `Today`, `Day 9 of 12`; none once completed. */
export function getTripCountdown(trip: Trip, now: DateTime): string | undefined {
  const status = getTripStatus(trip, now)
  if (status === 'completed') return undefined
  if (status === 'ongoing') return `Day ${getTripDayIndex(trip, now)} of ${getTripDuration(trip)}`

  const { years, months, days } = startDay(trip).calendarDiff(today(trip, now))
  const [value, unit] = years ? [years, 'year'] : months ? [months, 'month'] : [days, 'day']
  if (!value) return 'Today'
  return `In ${value} ${unit}${value === 1 ? '' : 's'}`
}

const byStart = (a: Trip, b: Trip) => a.startDate.instant.localeCompare(b.startDate.instant)

/** The ongoing trip, else the nearest upcoming one, else none. */
export function selectHomeTrip(trips: Trip[], now: DateTime): Trip | undefined {
  const unfinished = trips.filter((t) => getTripStatus(t, now) !== 'completed').sort(byStart)
  return unfinished.find((t) => getTripStatus(t, now) === 'ongoing') ?? unfinished[0]
}

/**
 * `Ongoing` (at most one trip, no count), `Upcoming n`, then one group per year of completed
 * trips. Unfinished trips run soonest first; completed trips most recent first.
 */
export function groupTrips(summaries: TripSummary[], now: DateTime): TripGroup[] {
  const unfinished = summaries.filter((s) => getTripStatus(s.trip, now) !== 'completed')
    .sort((a, b) => byStart(a.trip, b.trip))
  const completed = summaries.filter((s) => getTripStatus(s.trip, now) === 'completed')
    .sort((a, b) => byStart(b.trip, a.trip))

  const groups: TripGroup[] = []
  const ongoing = unfinished.find((s) => getTripStatus(s.trip, now) === 'ongoing')
  if (ongoing) groups.push({ label: 'Ongoing', trips: [ongoing] })

  const upcoming = unfinished.filter((s) => s !== ongoing)
  if (upcoming.length) groups.push({ label: 'Upcoming', count: upcoming.length, trips: upcoming })

  for (const s of completed) {
    const label = String(DateTime.from(s.trip.startDate).year)
    const last = groups[groups.length - 1]
    if (last?.label === label) {
      last.trips.push(s)
      last.count = last.trips.length
    } else {
      groups.push({ label, count: 1, trips: [s] })
    }
  }
  return groups
}

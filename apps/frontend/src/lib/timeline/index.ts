import { DateTime, formatTo, type ZonedInstant } from '@/lib/datetime'
import type { TripItemType } from '@/types'

/** One moment of a trip item: a departure, an arrival, a check-in, a check-out. */
export interface TimelineElement {
  id: string
  tripItemId: string
  type: TripItemType
  at: ZonedInstant
  /** The item's own name — `LH 1953`, `Hotel Weisses Kreuz` */
  title: string
  /** Role first, then where — `Departure · BER T1 · Seat 14A`; uppercase is CSS */
  summary: string
}

export interface TimelineDay {
  /** Midnight of the day in the trip's origin zone */
  date: ZonedInstant
  /** `otherDay` is set when the element's own local date is not the day's date */
  elements: (TimelineElement & { otherDay: boolean })[]
}

/**
 * Days are local dates in the trip's origin zone — the zone of its earliest element, filtered or
 * not — so buckets never move. Elements sort by instant, the filter runs before bucketing, and only
 * non-empty days are emitted.
 */
export function buildTimelineDays(elements: TimelineElement[], filter?: TripItemType): TimelineDay[] {
  const sorted = [...elements].sort((a, b) => a.at.instant.localeCompare(b.at.instant))
  const originZone = sorted[0]?.at.zone
  const days: TimelineDay[] = []
  let dayKey = ''

  for (const element of sorted) {
    if (filter && element.type !== filter) continue
    const bucket = DateTime.from({ instant: element.at.instant, zone: originZone })
    const key = formatTo.dateISO(bucket.toZonedInstant())
    if (key !== dayKey) {
      dayKey = key
      days.push({
        date: DateTime.fromObject({ year: bucket.year, month: bucket.month, day: bucket.day }, originZone).toZonedInstant(),
        elements: [],
      })
    }
    days[days.length - 1].elements.push({ ...element, otherDay: formatTo.dateISO(element.at) !== key })
  }
  return days
}

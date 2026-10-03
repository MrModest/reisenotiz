import { DateTime } from './datetime'
import type { ZonedInstant } from './types'

/**
 * The eight date shapes of `DESIGN-SYSTEM.md`. Each renders in its own `ZonedInstant`'s zone and
 * returns natural case; any uppercase is CSS.
 */
export const formatTo = {
  /** `08:40` */
  time: (at: ZonedInstant) => DateTime.from(at).format('HH:mm'),

  /** `Sat, 05 Sep` */
  dayShort: (at: ZonedInstant) => DateTime.from(at).format('EEE, dd LLL'),

  /** `5 Sep` */
  dayMonth: (at: ZonedInstant) => DateTime.from(at).format('d LLL'),

  /** `05` — the trip-list date block, with `monthShort` */
  dayOfMonth: (at: ZonedInstant) => DateTime.from(at).format('dd'),

  /** `Sep` — the trip-list date block, with `dayOfMonth` */
  monthShort: (at: ZonedInstant) => DateTime.from(at).format('LLL'),

  /** `5 – 16 Sep 2026`, `28 Sep – 3 Oct 2026`, `28 Dec 2026 – 3 Jan 2027` */
  dateRange: (start: ZonedInstant, end: ZonedInstant) => {
    const s = DateTime.from(start)
    const e = DateTime.from(end)
    const last = e.format('d LLL yyyy')
    if (s.year !== e.year) return `${s.format('d LLL yyyy')} – ${last}`
    if (s.month !== e.month) return `${s.format('d LLL')} – ${last}`
    if (s.day !== e.day) return `${s.format('d')} – ${last}`
    return last
  },

  /** `UTC+2`, `UTC+5:30`, `UTC-8`, `UTC+0` */
  utcOffset: (at: ZonedInstant) => `UTC${DateTime.from(at).format('Z')}`,

  /** `1h 20m` */
  duration: (start: ZonedInstant, end: ZonedInstant) => DateTime.duration(start, end).toFormat("h'h' mm'm'"),

  /** `2026-09-05` — the forms' date inputs */
  dateISO: (at: ZonedInstant) => DateTime.from(at).format('yyyy-MM-dd'),
}

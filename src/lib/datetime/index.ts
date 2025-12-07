/**
 * Datetime abstraction layer.
 *
 * This module encapsulates Luxon to provide timezone-aware date handling
 * without spreading library-specific code across the codebase.
 *
 * @example
 * ```typescript
 * import { DateTime, formatDateTime } from '@/lib/datetime'
 *
 * // Create a datetime in Los Angeles timezone
 * const departure = DateTime.fromObject(
 *   { year: 2025, month: 11, day: 23, hour: 10, minute: 0 },
 *   'America/Los_Angeles'
 * )
 *
 * // Convert to New York timezone
 * const arrivalTime = departure.toZone('America/New_York')
 *
 * // Format for display
 * console.log(formatDateTime(arrivalTime))
 *
 * // Serialize for storage
 * const stored = departure.toJSON() // { instant: "...", zone: "..." }
 *
 * // Deserialize from storage
 * const restored = DateTime.from(stored)
 * ```
 */

import {
  formatDate,
  formatDateISO,
  formatDateShort,
  formatDateTime,
  formatDayShort,
  formatRelative,
  formatTime
} from './formatters'

export { DateTime } from './datetime'
export type { ZonedInstant } from './types'
export const formatTo = {
  /**
   * Formats date as "Nov 23, 2025"
   */
  date: formatDate,

  /**
   * Formats time as "20:30"
   */
  time: formatTime,

  /**
   * Formats as "Nov 23, 2025 at 20:30"
   */
  dateTime: formatDateTime,

  /**
   * Formats as "23.11.2025"
   */
  dateShort: formatDateShort,

  /**
   * Formats date as "Sun, 23 Nov"
   */
  dayShort: formatDayShort,

  /**
   * Formats as "2025-11-23" (ISO date only)
   */
  dateISO: formatDateISO,

  /**
   * Formats relative time (e.g., "2 hours ago", "in 3 days")
   */
  relative: formatRelative
}

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

export { DateTime } from './datetime'
export type { ZonedInstant } from './types'
export {
  formatDate,
  formatTime,
  formatDateTime,
  formatDateShort,
  formatDateISO,
  formatRelative
} from './formatters'

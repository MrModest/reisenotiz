import { DateTime } from './datetime'
import { ZonedInstant } from './types'

/**
 * Common date/time formatting utilities.
 * These provide convenient presets on top of the DateTime class.
 */

/**
 * Formats date as "Nov 23, 2025"
 */
export function formatDate(dt: DateTime): string {
  return dt.format('LLL dd, yyyy')
}

/**
 * Formats time as "20:30"
 */
export function formatTime(dt: DateTime): string {
  return dt.format('HH:mm')
}

/**
 * Formats as "Nov 23, 2025 at 20:30"
 */
export function formatDateTime(dt: DateTime): string {
  return dt.format('LLL dd, yyyy \'at\' HH:mm')
}

/**
 * Formats as "23/11/2025"
 */
export function formatDateShort(dt: ZonedInstant): string {
  return DateTime.from(dt).format('dd/MM/yyyy')
}

/**
 * Formats as "2025-11-23" (ISO date only)
 */
export function formatDateISO(dt: DateTime): string {
  return dt.format('yyyy-MM-dd')
}

/**
 * Formats relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelative(dt: DateTime, base?: DateTime): string {
  return dt.toRelative(base) ?? formatDateTime(dt)
}

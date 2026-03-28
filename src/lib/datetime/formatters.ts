import { DateTime } from './datetime'
import type { ZonedInstant } from './types'

/**
 * Common date/time formatting utilities.
 * These provide convenient presets on top of the DateTime class.
 */

/**
 * Formats date as "Nov 23, 2025"
 */
export function formatDate(dt: ZonedInstant): string {
  return DateTime.from(dt).format('LLL dd, yyyy')
}

/**
 * Formats date as "Sun, 23 Nov"
 */
export function formatDayShort(dt: ZonedInstant): string {
  return DateTime.from(dt).format('EEE, dd LLL')
}

/**
 * Formats weekday as "Sunday"
 */
export function formatWeekday(dt: ZonedInstant): string {
  return DateTime.from(dt).format('EEEE')
}

/**
 * Formats as "Nov 23"
 */
export function formatDayMonth(dt: ZonedInstant): string {
  return DateTime.from(dt).format('LLL dd')
}

/**
 * Formats time as "20:30"
 */
export function formatTime(dt: ZonedInstant): string {
  return DateTime.from(dt).format('HH:mm')
}

/**
 * Formats as "Nov 23, 2025 at 20:30"
 */
export function formatDateTime(dt: DateTime): string {
  return dt.format("LLL dd, yyyy 'at' HH:mm")
}

/**
 * Formats as "23.11.2025"
 */
export function formatDateShort(dt: ZonedInstant): string {
  return DateTime.from(dt).format('dd.MM.yyyy')
}

/**
 * Formats as "2025-11-23" (ISO date only)
 */
export function formatDateISO(dt: ZonedInstant): string {
  return DateTime.from(dt).format('yyyy-MM-dd')
}

/**
 * Formats relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelative(dt: DateTime, base?: DateTime): string {
  return dt.toRelative(base) ?? formatDateTime(dt)
}

export function formatDuration(start: ZonedInstant, end: ZonedInstant): string {
  const duration = DateTime.duration(start, end)
  return `${duration.hours}h ${duration.minutes}m`
}

export function formatUtcOffset(datetime: ZonedInstant): string {
  return DateTime.from(datetime).utcOffset
}

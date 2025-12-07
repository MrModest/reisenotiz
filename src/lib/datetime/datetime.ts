import { DateTime as LuxonDateTime } from 'luxon'
import type { Duration, ZonedInstant } from './types'

/**
 * Immutable datetime abstraction for timezone-aware dates.
 * Encapsulates Luxon to prevent library-specific code from spreading across the codebase.
 */
export class DateTime {
  private constructor(private readonly dt: LuxonDateTime) {
    if (!dt.isValid) {
      throw new Error(`Invalid DateTime: ${dt.invalidReason}`)
    }
  }

  /**
   * Creates a DateTime from a ZonedInstant object (instant + zone).
   */
  static from(zonedInstant: ZonedInstant): DateTime {
    const dt = LuxonDateTime.fromISO(zonedInstant.instant, { zone: 'utc' }).setZone(zonedInstant.zone)
    return new DateTime(dt)
  }

  /**
   * Creates a DateTime from ISO string and timezone.
   */
  static fromISO(instant: string, zone: string): DateTime {
    const dt = LuxonDateTime.fromISO(instant, { zone: 'utc' }).setZone(zone)
    return new DateTime(dt)
  }

  /**
   * Creates a DateTime representing the current moment in the specified timezone.
   */
  static now(zone: string): DateTime {
    return new DateTime(LuxonDateTime.now().setZone(zone))
  }

  /**
   * Creates a DateTime from components in the specified timezone.
   */
  static fromObject(
    obj: { year: number; month: number; day: number; hour?: number; minute?: number; second?: number },
    zone: string
  ): DateTime {
    const dt = LuxonDateTime.fromObject({ ...obj }, { zone })
    return new DateTime(dt)
  }

  static duration(start: ZonedInstant, end: ZonedInstant): Duration {
    const startDate = DateTime.from(start)
    const endDate = DateTime.from(end)

    return endDate.dt.diff(startDate.dt, ['hours', 'minutes']).toObject() as Duration
  }

  /**
   * Serializes to ZonedInstant format for storage.
   */
  toJSON(): ZonedInstant {
    return {
      instant: this.dt.toUTC().toISO()!,
      zone: this.dt.zoneName!
    }
  }

  /**
   * Returns the IANA timezone name (e.g., "America/Los_Angeles").
   */
  get timezone(): string {
    return this.dt.zoneName!
  }

  /**
   * Returns the UTC instant as ISO string.
   */
  get instant(): string {
    return this.dt.toUTC().toISO()!
  }

  /**
   * Checks if this date is before another date.
   */
  isBefore(other: DateTime): boolean {
    return this.dt < other.dt
  }

  /**
   * Checks if this date is after another date.
   */
  isAfter(other: DateTime): boolean {
    return this.dt > other.dt
  }

  /**
   * Checks if this date is the same as another date (to the millisecond).
   */
  equals(other: DateTime): boolean {
    return this.dt.equals(other.dt)
  }

  /**
   * Converts this date to a different timezone.
   */
  toZone(zone: string): DateTime {
    return new DateTime(this.dt.setZone(zone))
  }

  /**
   * Formats the date according to a Luxon format string.
   * Common tokens: 'yyyy-MM-dd', 'HH:mm', 'DDD', 'DDDD'
   * See: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
   */
  format(formatString: string): string {
    return this.dt.toFormat(formatString)
  }

  /**
   * Returns ISO string in local timezone (e.g., "2025-11-23T10:00:00.000-08:00").
   */
  toISO(): string {
    return this.dt.toISO()!
  }

  /**
   * Returns JavaScript Date object (loses timezone information).
   */
  toJSDate(): Date {
    return this.dt.toJSDate()
  }

  /**
   * Returns human-readable relative time (e.g., "2 hours ago", "in 3 days").
   */
  toRelative(base?: DateTime): string | null {
    return this.dt.toRelative(base ? { base: base.dt } : undefined)
  }

  /**
   * Gets the year in the local timezone.
   */
  get year(): number {
    return this.dt.year
  }

  /**
   * Gets the month (1-12) in the local timezone.
   */
  get month(): number {
    return this.dt.month
  }

  /**
   * Gets the day of month (1-31) in the local timezone.
   */
  get day(): number {
    return this.dt.day
  }

  /**
   * Gets the hour (0-23) in the local timezone.
   */
  get hour(): number {
    return this.dt.hour
  }

  /**
   * Gets the minute (0-59) in the local timezone.
   */
  get minute(): number {
    return this.dt.minute
  }
}

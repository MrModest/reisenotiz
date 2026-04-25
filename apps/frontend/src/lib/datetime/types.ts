/**
 * Represents a specific moment in time within a timezone.
 */
export interface ZonedInstant {
  /**
   * UTC timestamp in ISO 8601 format (e.g., "2025-11-23T18:00:00.000Z")
   */
  instant: string
  /**
   * IANA timezone identifier (e.g., "America/Los_Angeles", "Europe/Berlin")
   */
  zone: string
}

/**
 * Represents a duration between two datetimes.
 */
export interface Duration {
  hours: number
  minutes: number
}

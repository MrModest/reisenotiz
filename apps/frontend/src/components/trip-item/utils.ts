import { DateTime, ZonedInstant } from '@/lib/datetime'

export function convertTime(date: string, time: string, tz: string): ZonedInstant {
  const [year, month, day] = date.split('-').map(s => parseInt(s))
  const [hour, minute] = time.split(':').map(s => parseInt(s))

  return DateTime.fromObject({
    year, month, day,
    hour, minute
  }, tz).toZonedInstant()
}

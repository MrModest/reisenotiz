import { describe, it, expect, afterEach } from 'vitest'
import { Settings } from 'luxon'
import { formatTo, type ZonedInstant } from '@/lib/datetime'

// Instants are written in UTC; each shape must render in the instant's own zone.
const at = (instant: string, zone: string): ZonedInstant => ({ instant, zone })

// 2026-09-05 06:40 UTC is 08:40 on Saturday 5 September in Berlin
const berlin = at('2026-09-05T06:40:00.000Z', 'Europe/Berlin')

describe('formatTo', () => {
  it('time is 24-hour in the instant’s own zone', () => {
    expect(formatTo.time(berlin)).toBe('08:40')
    expect(formatTo.time(at('2026-09-05T20:05:00.000Z', 'Europe/Berlin'))).toBe('22:05')
  })

  it('dayShort is English weekday, padded day and short month', () => {
    expect(formatTo.dayShort(berlin)).toBe('Sat, 05 Sep')
  })

  it('dayMonth is unpadded day and short month', () => {
    expect(formatTo.dayMonth(berlin)).toBe('5 Sep')
  })

  it('dayOfMonth and monthShort are the two halves of the trip-list date block', () => {
    expect(formatTo.dayOfMonth(berlin)).toBe('05')
    expect(formatTo.monthShort(berlin)).toBe('Sep')
  })

  it('dateISO is the machine date in the instant’s own zone', () => {
    expect(formatTo.dateISO(berlin)).toBe('2026-09-05')
  })

  describe('ignores the reader’s locale', () => {
    const systemLocale = Settings.defaultLocale
    afterEach(() => { Settings.defaultLocale = systemLocale })

    it('stays English under a German browser', () => {
      Settings.defaultLocale = 'de-DE'
      expect(formatTo.dayShort(berlin)).toBe('Sat, 05 Sep')
      expect(formatTo.dateRange(berlin, at('2026-10-03T10:00:00.000Z', 'Europe/Berlin'))).toBe('5 Sep – 3 Oct 2026')
    })
  })

  it('reads the date in the instant’s zone, not the reader’s', () => {
    // 23:30 UTC on 4 Sep is already 5 Sep in Tokyo and still 4 Sep in Los Angeles
    const instant = '2026-09-04T23:30:00.000Z'
    expect(formatTo.dayShort(at(instant, 'Asia/Tokyo'))).toBe('Sat, 05 Sep')
    expect(formatTo.dayShort(at(instant, 'America/Los_Angeles'))).toBe('Fri, 04 Sep')
  })

  describe('dateRange collapses what its ends share', () => {
    it('same month', () => {
      expect(formatTo.dateRange(
        at('2026-09-05T10:00:00.000Z', 'Europe/Berlin'),
        at('2026-09-16T10:00:00.000Z', 'Europe/Berlin'),
      )).toBe('5 – 16 Sep 2026')
    })

    it('same year', () => {
      expect(formatTo.dateRange(
        at('2026-09-28T10:00:00.000Z', 'Europe/Berlin'),
        at('2026-10-03T10:00:00.000Z', 'Europe/Berlin'),
      )).toBe('28 Sep – 3 Oct 2026')
    })

    it('across a year', () => {
      expect(formatTo.dateRange(
        at('2026-12-28T10:00:00.000Z', 'Europe/Berlin'),
        at('2027-01-03T10:00:00.000Z', 'Europe/Berlin'),
      )).toBe('28 Dec 2026 – 3 Jan 2027')
    })

    it('reads each end in its own zone', () => {
      // 23:30 UTC on 30 Sep is 1 Oct in Tokyo
      expect(formatTo.dateRange(
        at('2026-09-28T10:00:00.000Z', 'Europe/Berlin'),
        at('2026-09-30T23:30:00.000Z', 'Asia/Tokyo'),
      )).toBe('28 Sep – 1 Oct 2026')
    })
  })

  describe('utcOffset', () => {
    it.each([
      ['Europe/Berlin', 'UTC+2'],
      ['Asia/Kolkata', 'UTC+5:30'],
      ['America/Los_Angeles', 'UTC-7'],
      ['Etc/GMT+8', 'UTC-8'],
      ['UTC', 'UTC+0'],
    ])('%s reads %s', (zone, expected) => {
      expect(formatTo.utcOffset(at('2026-09-05T06:40:00.000Z', zone))).toBe(expected)
    })
  })

  it('duration is hours and padded minutes', () => {
    expect(formatTo.duration(
      at('2026-09-05T06:40:00.000Z', 'Europe/Berlin'),
      at('2026-09-05T08:00:00.000Z', 'Europe/Berlin'),
    )).toBe('1h 20m')
    // 08:40 Berlin → 09:40 London is two hours in the air
    expect(formatTo.duration(
      at('2026-09-05T06:40:00.000Z', 'Europe/Berlin'),
      at('2026-09-05T08:40:00.000Z', 'Europe/London'),
    )).toBe('2h 00m')
  })
})

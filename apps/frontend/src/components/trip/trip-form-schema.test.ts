import { describe, it, expect } from 'vitest'
import { DateTime } from '@/lib/datetime'
import { tripFormSchema, tripFormValues, tripFromFormValues } from './trip-form-schema'

const values = { name: 'Tokyo', description: '', startDate: '2026-09-05', endDate: '2026-09-16' }

describe('tripFormSchema', () => {
  it('accepts a 100-character name and rejects 101', () => {
    expect(tripFormSchema.safeParse({ ...values, name: 'a'.repeat(100) }).success).toBe(true)
    expect(tripFormSchema.safeParse({ ...values, name: 'a'.repeat(101) }).success).toBe(false)
  })

  it('rejects an end date before the start date, on the end date', () => {
    const result = tripFormSchema.safeParse({ ...values, endDate: '2026-09-04' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['endDate'])
  })

  it('accepts a one-day trip', () => {
    expect(tripFormSchema.safeParse({ ...values, endDate: values.startDate }).success).toBe(true)
  })
})

describe('trip form values', () => {
  it('reads each date in the trip’s own zone', () => {
    const trip = {
      id: 't',
      name: 'Tokyo',
      description: 'Food',
      // 5 Sep 00:30 in Tokyo is still 4 Sep in UTC
      startDate: DateTime.fromObject({ year: 2026, month: 9, day: 5, hour: 0, minute: 30 }, 'Asia/Tokyo').toZonedInstant(),
      endDate: DateTime.fromObject({ year: 2026, month: 9, day: 16 }, 'Asia/Tokyo').toZonedInstant(),
    }
    expect(tripFormValues(trip)).toEqual({ name: 'Tokyo', description: 'Food', startDate: '2026-09-05', endDate: '2026-09-16' })
  })

  it('anchors both dates to the start of the day in the given zone', () => {
    const trip = tripFromFormValues(values, 'Asia/Tokyo')
    expect(trip.startDate).toEqual(DateTime.fromObject({ year: 2026, month: 9, day: 5 }, 'Asia/Tokyo').toZonedInstant())
    expect(trip.endDate.zone).toBe('Asia/Tokyo')
    expect(tripFormValues({ id: 't', ...trip })).toEqual(values)
  })
})

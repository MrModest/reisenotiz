import { describe, expect, it } from 'vitest'
import { countNights } from './nights'

const at = (instant: string) => ({ instant, zone: 'Europe/Vienna' })
const provided = { in: at('2026-09-05T12:00:00.000Z'), out: at('2026-09-08T09:00:00.000Z') }

describe('countNights', () => {
  it('counts calendar dates between check-in and check-out, whatever the times', () => {
    expect(countNights(provided)).toBe(3)
  })

  it('is zero when check-in equals check-out', () => {
    expect(countNights({ in: provided.in, out: provided.in })).toBe(0)
  })

  it('reads the dates in the stay zone, not in UTC', () => {
    // 23:30 on 5 Sep and 00:30 on 6 Sep in Vienna, both on 5 Sep in UTC
    expect(countNights({ in: at('2026-09-05T21:30:00.000Z'), out: at('2026-09-05T22:30:00.000Z') })).toBe(1)
  })
})

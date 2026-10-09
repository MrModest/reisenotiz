import { describe, expect, it } from 'vitest'
import type { Accommodation } from '@/types'
import { countNights, unusedNightNote } from './nights'

const at = (instant: string) => ({ instant, zone: 'Europe/Vienna' })
const provided = { in: at('2026-09-05T12:00:00.000Z'), out: at('2026-09-08T09:00:00.000Z') }
const stay = (planned?: Accommodation['stayInterval']['planned']) => ({ provided, planned })

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

describe('unusedNightNote', () => {
  it('is absent without a plan', () => {
    expect(unusedNightNote(stay())).toBeUndefined()
  })

  it('is absent when the plan arrives later on the check-in day and leaves on the check-out day', () => {
    expect(unusedNightNote(stay({ in: at('2026-09-05T14:40:00.000Z'), out: at('2026-09-08T08:30:00.000Z') }))).toBeUndefined()
  })

  it('names a later-day arrival and the nights it leaves unused', () => {
    expect(unusedNightNote(stay({ in: at('2026-09-06T14:40:00.000Z'), out: provided.out }))).toBe('Arriving 6 Sep · 1 paid night unused')
  })

  it('names an earlier-day departure, counting each night', () => {
    expect(unusedNightNote(stay({ in: provided.in, out: at('2026-09-06T08:00:00.000Z') }))).toBe('Leaving 6 Sep · 2 paid nights unused')
  })

  it('names both ends when the plan is short at both', () => {
    expect(unusedNightNote(stay({ in: at('2026-09-06T14:40:00.000Z'), out: at('2026-09-07T08:00:00.000Z') }))).toBe(
      'Arriving 6 Sep · 1 paid night unused · Leaving 7 Sep · 1 paid night unused',
    )
  })

  it('reads the arrival date in the stay zone', () => {
    // 22:30Z on 5 Sep is 00:30 on 6 Sep in Vienna
    expect(unusedNightNote(stay({ in: at('2026-09-05T22:30:00.000Z'), out: provided.out }))).toBe('Arriving 6 Sep · 1 paid night unused')
  })
})

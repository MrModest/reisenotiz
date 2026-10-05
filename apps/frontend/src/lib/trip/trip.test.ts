import { describe, it, expect } from 'vitest'
import { DateTime } from '@/lib/datetime'
import type { Trip } from '@/types'
import {
  getHomeCountdown,
  getTripCountdown,
  getTripDayIndex,
  getTripDuration,
  getTripStatus,
  groupTrips,
  selectHomeTrip,
  type TripSummary,
} from '.'

const ZONE = 'Europe/Berlin'

type Ymd = [number, number, number]

function at([year, month, day]: Ymd, hour = 0, zone = ZONE) {
  return DateTime.fromObject({ year, month, day, hour }, zone)
}

function trip(id: string, start: Ymd, end: Ymd): Trip {
  return {
    id,
    name: id,
    description: '',
    startDate: at(start).toZonedInstant(),
    endDate: at(end).toZonedInstant(),
  }
}

function summary(t: Trip, itemCount = 0): TripSummary {
  return { trip: t, itemCount }
}

// 5 – 16 Sep 2026, twelve days
const alps = trip('alps', [2026, 9, 5], [2026, 9, 16])

describe('getTripStatus', () => {
  it('is upcoming before the first day', () => {
    expect(getTripStatus(alps, at([2026, 9, 4], 23))).toBe('upcoming')
  })

  it('is ongoing from the first day through the whole last day', () => {
    expect(getTripStatus(alps, at([2026, 9, 5]))).toBe('ongoing')
    expect(getTripStatus(alps, at([2026, 9, 16], 23))).toBe('ongoing')
  })

  it('is completed from the day after the last', () => {
    expect(getTripStatus(alps, at([2026, 9, 17]))).toBe('completed')
  })

  it('reads the calendar day in the trip zone, not the reader zone', () => {
    // 23:00 on 4 Sep in New York is already 5 Sep in Berlin
    expect(getTripStatus(alps, at([2026, 9, 4], 23, 'America/New_York'))).toBe('ongoing')
  })

  it('is upcoming until the start instant on its first day', () => {
    const afternoon = { ...alps, startDate: at([2026, 9, 5], 15).toZonedInstant() }
    expect(getTripStatus(afternoon, at([2026, 9, 5], 9))).toBe('upcoming')
    expect(getTripStatus(afternoon, at([2026, 9, 5], 15))).toBe('ongoing')
  })
})

describe('getTripDuration', () => {
  it('counts both ends', () => {
    expect(getTripDuration(alps)).toBe(12)
    expect(getTripDuration(trip('day', [2026, 9, 5], [2026, 9, 5]))).toBe(1)
  })

  it('counts calendar days across a DST change', () => {
    expect(getTripDuration(trip('dst', [2026, 10, 24], [2026, 10, 26]))).toBe(3)
  })

  it('counts days across a month boundary', () => {
    expect(getTripDuration(trip('long', [2026, 9, 5], [2026, 10, 16]))).toBe(42)
  })
})

describe('getTripDayIndex', () => {
  it('is 1 on the first day and N on the last', () => {
    expect(getTripDayIndex(alps, at([2026, 9, 5]))).toBe(1)
    expect(getTripDayIndex(alps, at([2026, 9, 13], 18))).toBe(9)
    expect(getTripDayIndex(alps, at([2026, 9, 16], 23))).toBe(12)
  })

  it('keeps counting past a month boundary', () => {
    expect(getTripDayIndex(trip('long', [2026, 9, 5], [2026, 10, 16]), at([2026, 10, 6]))).toBe(32)
  })
})

describe('getTripCountdown', () => {
  const startingOn = (start: Ymd) => trip('t', start, [start[0] + 2, 1, 1])
  const now = at([2026, 1, 10], 12)

  it.each<[Ymd, string]>([
    [[2026, 1, 11], 'In 1 day'],
    [[2026, 1, 17], 'In 7 days'],
    [[2026, 2, 8], 'In 29 days'],
    [[2026, 2, 9], 'In 30 days'],
    [[2026, 2, 10], 'In 1 month'],
    [[2026, 2, 12], 'In 1 month'],
    [[2026, 4, 19], 'In 3 months'],
    [[2026, 12, 10], 'In 11 months'],
    [[2026, 12, 31], 'In 11 months'],
    [[2027, 1, 10], 'In 1 year'],
    [[2027, 7, 10], 'In 1 year'],
    [[2029, 2, 1], 'In 3 years'],
  ])('starting %j reads %s', (start, expected) => {
    expect(getTripCountdown(startingOn(start), now)).toBe(expected)
  })

  it('uses calendar months, not 30-day blocks', () => {
    // 28 days in February 2026: one calendar month, where days / 30 would say 0
    expect(getTripCountdown(startingOn([2026, 3, 1]), at([2026, 2, 1]))).toBe('In 1 month')
  })

  it('reads Today on the first day before the start instant', () => {
    const afternoon = { ...alps, startDate: at([2026, 9, 5], 15).toZonedInstant() }
    expect(getTripCountdown(afternoon, at([2026, 9, 5], 9))).toBe('Today')
  })

  it('reads Day 1 of N on the first day once started', () => {
    expect(getTripCountdown(alps, at([2026, 9, 5], 9))).toBe('Day 1 of 12')
  })

  it('reads the day index while ongoing', () => {
    expect(getTripCountdown(alps, at([2026, 9, 13]))).toBe('Day 9 of 12')
  })

  it('has none once completed', () => {
    expect(getTripCountdown(alps, at([2026, 9, 17]))).toBeUndefined()
  })
})

describe('getHomeCountdown', () => {
  it('counts whole days to go, never a larger unit', () => {
    expect(getHomeCountdown(alps, at([2026, 8, 29], 22))).toEqual({ value: '7', caption: 'Days to go' })
    expect(getHomeCountdown(alps, at([2026, 9, 4], 23))).toEqual({ value: '1', caption: 'Day to go' })
    expect(getHomeCountdown(alps, at([2026, 6, 5]))).toEqual({ value: '92', caption: 'Days to go' })
  })

  it('reads Today on the first day before the start instant', () => {
    const afternoon = { ...alps, startDate: at([2026, 9, 5], 15).toZonedInstant() }
    expect(getHomeCountdown(afternoon, at([2026, 9, 5], 9))).toEqual({ value: 'Today' })
  })

  it('reads the day index of the duration while ongoing, day one included', () => {
    expect(getHomeCountdown(alps, at([2026, 9, 5], 9))).toEqual({ value: '1', caption: 'Of 12 days' })
    expect(getHomeCountdown(alps, at([2026, 9, 7]))).toEqual({ value: '3', caption: 'Of 12 days' })
  })

  it('has none once completed', () => {
    expect(getHomeCountdown(alps, at([2026, 9, 17]))).toBeUndefined()
  })
})

describe('selectHomeTrip', () => {
  const past = summary(trip('past', [2026, 3, 1], [2026, 3, 5]))
  const near = summary(trip('near', [2026, 10, 1], [2026, 10, 5]))
  const far = summary(trip('far', [2027, 1, 1], [2027, 1, 5]))
  const ongoing = summary(alps)

  it('picks the ongoing trip over any upcoming one', () => {
    expect(selectHomeTrip([near, ongoing, past], at([2026, 9, 10]))).toBe(ongoing)
  })

  it('picks the nearest upcoming trip when none is ongoing', () => {
    expect(selectHomeTrip([far, past, near], at([2026, 9, 20]))).toBe(near)
  })

  it('picks none when every trip is completed', () => {
    expect(selectHomeTrip([past, ongoing], at([2026, 9, 20]))).toBeUndefined()
    expect(selectHomeTrip([], at([2026, 9, 20]))).toBeUndefined()
  })
})

describe('groupTrips', () => {
  const now = at([2026, 9, 10])
  const ids = (groups: ReturnType<typeof groupTrips>) =>
    groups.map((g) => ({ label: g.label, count: g.count, ids: g.trips.map((s) => s.trip.id) }))

  it('puts unfinished trips first, soonest first, then completed by year, most recent first', () => {
    const groups = groupTrips(
      [
        summary(trip('vienna', [2025, 3, 7], [2025, 3, 9])),
        summary(trip('lisbon', [2026, 10, 16], [2026, 10, 25])),
        summary(trip('copenhagen', [2026, 2, 20], [2026, 2, 23])),
        summary(alps),
        summary(trip('kyoto', [2027, 4, 1], [2027, 4, 9])),
        summary(trip('seville', [2026, 4, 3], [2026, 4, 10])),
        summary(trip('japan', [2025, 10, 18], [2025, 11, 2])),
      ],
      now,
    )

    expect(ids(groups)).toEqual([
      { label: 'Ongoing', count: undefined, ids: ['alps'] },
      { label: 'Upcoming', count: 2, ids: ['lisbon', 'kyoto'] },
      { label: '2026', count: 2, ids: ['seville', 'copenhagen'] },
      { label: '2025', count: 2, ids: ['japan', 'vienna'] },
    ])
  })

  it('holds at most one ongoing trip; an overlapping one falls into Upcoming', () => {
    const overlap = trip('overlap', [2026, 9, 8], [2026, 9, 20])
    expect(ids(groupTrips([summary(overlap), summary(alps)], now))).toEqual([
      { label: 'Ongoing', count: undefined, ids: ['alps'] },
      { label: 'Upcoming', count: 1, ids: ['overlap'] },
    ])
  })

  it('emits no empty group', () => {
    expect(groupTrips([], now)).toEqual([])
    expect(ids(groupTrips([summary(trip('next', [2026, 12, 1], [2026, 12, 3]))], now))).toEqual([
      { label: 'Upcoming', count: 1, ids: ['next'] },
    ])
  })
})

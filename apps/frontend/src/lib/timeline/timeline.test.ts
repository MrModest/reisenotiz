import { describe, expect, it } from 'vitest'
import { formatTo } from '@/lib/datetime'
import type { TripItemType } from '@/types'
import { buildTimelineDays, type TimelineElement } from '.'

function element(id: string, instant: string, zone: string, type: TripItemType = 'Flight'): TimelineElement {
  return { id, tripItemId: id, type, at: { instant, zone }, title: id, summary: '' }
}

const shape = (days: ReturnType<typeof buildTimelineDays>) =>
  days.map((d) => ({ date: formatTo.dateISO(d.date), ids: d.elements.map((e) => e.id) }))

describe('buildTimelineDays', () => {
  it('buckets in the origin zone and flags an element whose own date differs (Tokyo to Honolulu)', () => {
    const days = buildTimelineDays([
      element('check-in', '2026-09-06T11:00:00.000Z', 'Pacific/Honolulu', 'Accommodation'),
      element('arrival', '2026-09-06T08:00:00.000Z', 'Pacific/Honolulu'),
      element('departure', '2026-09-05T15:05:00.000Z', 'Asia/Tokyo'),
    ])

    expect(shape(days)).toEqual([{ date: '2026-09-06', ids: ['departure', 'arrival', 'check-in'] }])
    expect(days[0].elements.map((e) => e.otherDay)).toEqual([false, true, false])
    expect(formatTo.time(days[0].elements[1].at)).toBe('22:00')
  })

  it('sorts by instant, never by displayed time', () => {
    const days = buildTimelineDays([
      element('late-in-berlin', '2026-09-05T08:00:00.000Z', 'Europe/Berlin'),
      element('early-in-london', '2026-09-05T07:30:00.000Z', 'Europe/London'),
    ])
    expect(shape(days)).toEqual([{ date: '2026-09-05', ids: ['early-in-london', 'late-in-berlin'] }])
  })

  it('filters before bucketing and emits no empty day', () => {
    const elements = [
      element('flight', '2026-09-05T08:00:00.000Z', 'Europe/Berlin'),
      element('stay', '2026-09-06T14:00:00.000Z', 'Europe/Vienna', 'Accommodation'),
      element('flight-back', '2026-09-09T08:00:00.000Z', 'Europe/Vienna'),
    ]
    expect(shape(buildTimelineDays(elements))).toEqual([
      { date: '2026-09-05', ids: ['flight'] },
      { date: '2026-09-06', ids: ['stay'] },
      { date: '2026-09-09', ids: ['flight-back'] },
    ])
    expect(shape(buildTimelineDays(elements, 'Flight'))).toEqual([
      { date: '2026-09-05', ids: ['flight'] },
      { date: '2026-09-09', ids: ['flight-back'] },
    ])
  })

  it('keeps the origin zone of the earliest element when a filter hides it', () => {
    const days = buildTimelineDays([
      element('departure', '2026-09-05T15:05:00.000Z', 'Asia/Tokyo'),
      element('check-in', '2026-09-06T09:30:00.000Z', 'Pacific/Honolulu', 'Accommodation'),
    ], 'Accommodation')

    // Honolulu's own date is 5 Sep, Tokyo's is 6 Sep
    expect(shape(days)).toEqual([{ date: '2026-09-06', ids: ['check-in'] }])
    expect(days[0].elements[0].otherDay).toBe(true)
  })

  it('returns no days for no elements', () => {
    expect(buildTimelineDays([])).toEqual([])
  })
})

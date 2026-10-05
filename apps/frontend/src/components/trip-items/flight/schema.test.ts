import { describe, expect, it } from 'vitest'
import type { SavedPlaceEntry } from '@/store'
import type { Flight } from '@/types'
import { createFlightDraft } from './draft'
import { flightFormSchema, flightFormValues, flightFromFormValues, unresolvedAirports } from './schema'

const airport = (code: string, tzone: string): SavedPlaceEntry => ({
  type: 'Airport',
  key: code,
  place: { code, name: code, address: { countryCode: 'DE', city: '' }, tzone },
})

describe('flightFromFormValues', () => {
  const draft: Flight = createFlightDraft('trip')
  const values = {
    ...flightFormValues(draft),
    flightNumber: 'LH 716',
    departure: { placeKey: 'MUC', date: '2026-09-05', time: '12:00', terminal: '2', gate: '' },
    arrival: { placeKey: 'HND', date: '2026-09-06', time: '08:30', terminal: '', gate: '' },
  }

  it('anchors each typed time to its own airport zone, never the device zone', () => {
    const flight = flightFromFormValues(values, draft, [airport('MUC', 'Europe/Berlin'), airport('HND', 'Asia/Tokyo')])

    expect(flight.departure).toEqual({
      placeKey: 'MUC',
      terminal: '2',
      gate: '',
      time: { instant: '2026-09-05T10:00:00.000Z', zone: 'Europe/Berlin' },
    })
    expect(flight.arrival.time).toEqual({ instant: '2026-09-05T23:30:00.000Z', zone: 'Asia/Tokyo' })
  })

  it('keeps the zone a point had when its unchanged airport link dangles', () => {
    const saved: Flight = { ...draft, arrival: { ...draft.arrival, placeKey: 'HND', time: { ...draft.arrival.time, zone: 'Asia/Tokyo' } } }
    const flight = flightFromFormValues(values, saved, [airport('MUC', 'Europe/Berlin')])
    expect(flight.arrival.time.zone).toBe('Asia/Tokyo')
  })

  it('adds a passenger name still being typed', () => {
    const flight = flightFromFormValues({ ...values, passengerDraft: ' Anna Weber ' }, draft, [airport('MUC', 'Europe/Berlin'), airport('HND', 'Asia/Tokyo')])
    expect(flight.passengers.map((p) => p.fullname)).toEqual(['Anna Weber'])
  })
})

describe('unresolvedAirports', () => {
  const draft: Flight = { ...createFlightDraft('trip'), departure: { ...createFlightDraft('trip').departure, placeKey: 'MUC' } }
  const values = flightFormValues(draft)

  // Another airport's zone would put the time hours off
  it('names a point whose newly picked airport is gone, never one whose link did not change', () => {
    const changed = { ...values, arrival: { ...values.arrival, placeKey: 'HND' } }
    expect(unresolvedAirports(changed, draft, [])).toEqual(['arrival'])
    expect(unresolvedAirports(changed, draft, [airport('HND', 'Asia/Tokyo')])).toEqual([])
  })
})

describe('flightFormSchema', () => {
  it('requires both airports', () => {
    const result = flightFormSchema.safeParse(flightFormValues(createFlightDraft('trip')))
    expect(result.error?.issues.map((i) => [i.path.join('.'), i.message])).toEqual([
      ['departure.placeKey', 'Airport is required'],
      ['arrival.placeKey', 'Airport is required'],
    ])
  })
})

import { describe, expect, it } from 'vitest'
import type { Airport, Flight } from '@/types'
import { createFlightDraft } from './draft'
import { flightFormSchema, flightFormValues, flightFromFormValues } from './schema'

const airport = (code: string, tzone: string, id = `iata:${code}`): Airport => ({
  id,
  type: 'Airport',
  code,
  name: code,
  address: { countryCode: 'DE', city: 'Munich' },
  tzone,
})

describe('flightFromFormValues', () => {
  const draft: Flight = createFlightDraft('trip')
  const values = {
    ...flightFormValues(draft),
    flightNumber: 'LH 716',
    departure: { place: airport('MUC', 'Europe/Berlin'), date: '2026-09-05', time: '12:00', terminal: '2', gate: '' },
    arrival: { place: airport('HND', 'Asia/Tokyo'), date: '2026-09-06', time: '08:30', terminal: '', gate: '' },
  }

  it('anchors each typed time to its own airport zone, never the device zone', () => {
    const flight = flightFromFormValues(values, draft)

    expect(flight.departure).toEqual({
      place: airport('MUC', 'Europe/Berlin'),
      terminal: '2',
      gate: '',
      time: { instant: '2026-09-05T10:00:00.000Z', zone: 'Europe/Berlin' },
    })
    expect(flight.arrival.time).toEqual({ instant: '2026-09-05T23:30:00.000Z', zone: 'Asia/Tokyo' })
  })

  it('gives an airport typed in by hand a custom id, and keeps the id of a picked one', () => {
    const typed = { ...values.arrival, place: airport('XFW', 'Europe/Berlin', '') }
    const flight = flightFromFormValues({ ...values, arrival: typed }, draft)

    expect(flight.departure.place.id).toBe('iata:MUC')
    expect(flight.arrival.place.id).toMatch(/^custom:/)
  })

  it('adds a passenger name still being typed', () => {
    const flight = flightFromFormValues({ ...values, passengerDraft: ' Anna Weber ' }, draft)
    expect(flight.passengers.map((p) => p.fullname)).toEqual(['Anna Weber'])
  })
})

describe('flightFormSchema', () => {
  it('requires both airports', () => {
    const result = flightFormSchema.safeParse(flightFormValues(createFlightDraft('trip')))
    const fields = new Set(result.error?.issues.map((i) => i.path.slice(0, 2).join('.')))
    expect(fields).toEqual(new Set(['departure.place', 'arrival.place']))
  })
})

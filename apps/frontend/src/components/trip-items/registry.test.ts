import { describe, expect, it } from 'vitest'
import type { Accommodation, Flight, TripItem } from '@/types'
import { getTripItemModule, presentTripItemModules, toTimelineElements } from './registry'
import { createFlightDraft } from './flight/draft'
import { createAccommodationDraft } from './accommodation/draft'

const at = (instant: string, zone = 'Europe/Berlin') => ({ instant, zone })

describe('getTripItemModule', () => {
  it('returns the module for a known type', () => {
    expect(getTripItemModule('Accommodation')?.label).toBe('Stay')
  })

  it('returns undefined for a type this build does not know', () => {
    expect(getTripItemModule('LongTransfer')).toBeUndefined()
    expect(getTripItemModule('toString')).toBeUndefined()
  })
})

describe('presentTripItemModules', () => {
  const flight = createFlightDraft('trip')
  const stay = createAccommodationDraft('trip')
  const unknown = { ...flight, type: 'LongTransfer' } as unknown as TripItem

  it('lists one module per type present, once each, never an unknown type', () => {
    expect(presentTripItemModules([stay, flight, flight, unknown]).map((m) => m.label)).toEqual(['Flight', 'Stay'])
    expect(presentTripItemModules([stay]).map((m) => m.label)).toEqual(['Stay'])
    expect(presentTripItemModules([])).toEqual([])
  })

  it('gives every known item its elements and an unknown one none', () => {
    expect(toTimelineElements([flight, stay, unknown]).map((e) => e.tripItemId)).toEqual([flight.id, flight.id, stay.id, stay.id])
  })
})

describe('flight toTimelineElements', () => {
  const draft = createFlightDraft('trip')
  const flight: Flight = {
    ...draft,
    id: 'f1',
    flightNumber: 'LH 1953',
    seat: '14A',
    departure: { ...draft.departure, airport: { ...draft.departure.airport, code: 'BER' }, terminal: '1', time: at('2026-09-05T06:40:00.000Z') },
    arrival: { ...draft.arrival, airport: { ...draft.arrival.airport, code: 'MUC' }, terminal: '2', time: at('2026-09-05T08:00:00.000Z') },
  }
  const toElements = (f: Flight) => getTripItemModule('Flight')!.toTimelineElements(f)

  it('is a departure and an arrival, both titled with the flight number', () => {
    expect(toElements(flight)).toEqual([
      { id: 'f1-departure', tripItemId: 'f1', type: 'Flight', at: flight.departure.time, title: 'LH 1953', summary: 'Departure · BER T1 · Seat 14A' },
      { id: 'f1-arrival', tripItemId: 'f1', type: 'Flight', at: flight.arrival.time, title: 'LH 1953', summary: 'Arrival · MUC T2' },
    ])
  })

  it('leaves out a missing terminal and seat', () => {
    const bare = { ...flight, seat: '', departure: { ...flight.departure, terminal: '' } }
    expect(toElements(bare)[0].summary).toBe('Departure · BER')
  })
})

describe('stay toTimelineElements', () => {
  const draft = createAccommodationDraft('trip')
  const stay: Accommodation = {
    ...draft,
    id: 's1',
    site: { ...draft.site, name: 'Hotel Weisses Kreuz', address: { ...draft.site.address, line: 'Herzog-Friedrich-Strasse 31' } },
    stayInterval: { provided: { in: at('2026-09-05T13:00:00.000Z'), out: at('2026-09-08T08:00:00.000Z') } },
  }
  const toElements = (s: Accommodation) => getTripItemModule('Accommodation')!.toTimelineElements(s)

  it('is a check-in and a check-out at the provided times when nothing is planned', () => {
    expect(toElements(stay)).toEqual([
      { id: 's1-checkIn', tripItemId: 's1', type: 'Accommodation', at: stay.stayInterval.provided.in, title: 'Hotel Weisses Kreuz', summary: 'Check-in · Herzog-Friedrich-Strasse 31' },
      { id: 's1-checkOut', tripItemId: 's1', type: 'Accommodation', at: stay.stayInterval.provided.out, title: 'Hotel Weisses Kreuz', summary: 'Check-out · Herzog-Friedrich-Strasse 31' },
    ])
  })

  it('sits at the planned times when there is a plan', () => {
    const planned = { in: at('2026-09-05T16:40:00.000Z'), out: at('2026-09-08T07:30:00.000Z') }
    const elements = toElements({ ...stay, stayInterval: { ...stay.stayInterval, planned } })
    expect(elements.map((e) => e.at)).toEqual([planned.in, planned.out])
  })
})

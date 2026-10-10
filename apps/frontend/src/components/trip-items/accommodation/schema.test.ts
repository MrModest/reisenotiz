import { describe, expect, it } from 'vitest'
import type { SavedPlaceEntry } from '@/store'
import type { Accommodation } from '@/types'
import { createAccommodationDraft } from './draft'
import { stayFormSchema, stayFormValues, stayFromFormValues, type StayFormValues } from './schema'

const site: SavedPlaceEntry = {
  type: 'AccommodationSite',
  key: 'site-1',
  place: { name: 'Hotel Weisses Kreuz', kind: 'Hotel', address: { countryCode: 'AT', city: 'Innsbruck' }, tzone: 'Europe/Vienna' },
}

const draft: Accommodation = createAccommodationDraft('trip')
const booked: StayFormValues = {
  ...stayFormValues(draft),
  placeKey: 'site-1',
  provided: { dateIn: '2026-09-05', timeIn: '14:00', dateOut: '2026-09-08', timeOut: '11:00' },
}
const plan = (dateIn: string, timeIn: string, dateOut: string, timeOut: string) => ({ ...booked, planned: { dateIn, timeIn, dateOut, timeOut } })
const issues = (values: StayFormValues) =>
  stayFormSchema([site]).safeParse(values).error?.issues.map((i) => [i.path.join('.'), i.message]) ?? []

describe('stayFormSchema', () => {
  it('accepts a booking without a plan', () => {
    expect(issues(booked)).toEqual([])
  })

  it('accepts a later-day arrival, which leaves a paid night unused', () => {
    expect(issues(plan('2026-09-06', '13:30', '2026-09-08', '11:00'))).toEqual([])
  })

  it('refuses an arrival before check-in opens', () => {
    expect(issues(plan('2026-09-05', '13:59', '2026-09-08', '11:00'))).toEqual([['planned.dateIn', 'You arrive before check-in']])
  })

  it('refuses a departure after the check-out time', () => {
    expect(issues(plan('2026-09-05', '16:40', '2026-09-08', '11:01'))).toEqual([['planned.dateOut', 'You leave after check-out']])
  })

  it('asks for the rest of a plan once any of it is typed', () => {
    expect(issues(plan('2026-09-06', '', '', ''))).toEqual([
      ['planned.timeIn', 'Required for a plan'],
      ['planned.dateOut', 'Required for a plan'],
      ['planned.timeOut', 'Required for a plan'],
    ])
  })

  it('refuses a check-out before check-in', () => {
    expect(issues({ ...booked, provided: { ...booked.provided, dateOut: '2026-09-04' } })).toEqual([
      ['provided.dateOut', 'Check-out is before check-in'],
    ])
  })

  it('requires a saved property', () => {
    expect(issues({ ...booked, placeKey: '' })).toEqual([['placeKey', 'Property is required']])
    expect(issues({ ...booked, placeKey: 'gone' })).toEqual([['placeKey', 'Unknown place, pick the property again']])
  })
})

describe('stayFromFormValues', () => {
  it('anchors each typed time to the site zone, never the device zone', () => {
    const stay = stayFromFormValues(plan('2026-09-06', '13:30', '2026-09-08', '11:00'), draft, [site])

    expect(stay.placeKey).toBe('site-1')
    expect(stay.stayInterval).toEqual({
      provided: {
        in: { instant: '2026-09-05T12:00:00.000Z', zone: 'Europe/Vienna' },
        out: { instant: '2026-09-08T09:00:00.000Z', zone: 'Europe/Vienna' },
      },
      planned: {
        in: { instant: '2026-09-06T11:30:00.000Z', zone: 'Europe/Vienna' },
        out: { instant: '2026-09-08T09:00:00.000Z', zone: 'Europe/Vienna' },
      },
    })
  })

  it('saves no plan when the plan is empty', () => {
    expect(stayFromFormValues(booked, draft, [site]).stayInterval.planned).toBeUndefined()
  })

  it('saves guests, a guest name still being typed, and who reserved it as people', () => {
    const anna = { id: 'p1', fullname: ' Anna Weber ', contacts: ['+43 1'] }
    const stay = stayFromFormValues({ ...booked, guestDraft: ' Jonas Weber ', reservedOn: anna }, draft, [site])
    expect(stay.guests.map((p) => p.fullname)).toEqual(['Jonas Weber'])
    expect(stay.reservedOn).toEqual({ ...anna, fullname: 'Anna Weber' })
  })

  it('saves nobody as having reserved it when the name is empty', () => {
    const stay = { ...draft, reservedOn: { id: 'p1', fullname: 'Anna Weber', contacts: [] } }
    expect(stayFromFormValues(booked, stay, [site]).reservedOn).toBeUndefined()
  })
})

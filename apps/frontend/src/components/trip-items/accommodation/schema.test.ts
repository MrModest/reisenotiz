import { describe, expect, it } from 'vitest'
import type { Accommodation, AccommodationSite } from '@/types'
import { createAccommodationDraft } from './draft'
import { stayFormSchema, stayFormValues, stayFromFormValues, type StayFormValues } from './schema'

const site: AccommodationSite = {
  id: 'custom:kreuz',
  type: 'AccommodationSite',
  name: 'Hotel Weisses Kreuz',
  kind: 'Hotel',
  address: { countryCode: 'AT', city: 'Innsbruck' },
  tzone: 'Europe/Vienna',
}

const draft: Accommodation = createAccommodationDraft('trip')
const booked: StayFormValues = {
  ...stayFormValues(draft),
  place: site,
  provided: { dateIn: '2026-09-05', timeIn: '14:00', dateOut: '2026-09-08', timeOut: '11:00' },
}
const plan = (dateIn: string, timeIn: string, dateOut: string, timeOut: string) => ({ ...booked, planned: { dateIn, timeIn, dateOut, timeOut } })
const issues = (values: StayFormValues) =>
  stayFormSchema.safeParse(values).error?.issues.map((i) => [i.path.join('.'), i.message]) ?? []

describe('stayFormSchema', () => {
  it('accepts a booking without a plan', () => {
    expect(issues(booked)).toEqual([])
  })

  it('accepts a later-day arrival', () => {
    expect(issues(plan('2026-09-06', '13:30', '2026-09-08', '11:00'))).toEqual([])
  })

  it('refuses an arrival before check-in opens', () => {
    expect(issues(plan('2026-09-05', '13:59', '2026-09-08', '11:00'))).toEqual([['planned.dateIn', 'You arrive before check-in']])
  })

  it('refuses a departure after the check-out time', () => {
    expect(issues(plan('2026-09-05', '16:40', '2026-09-08', '11:01'))).toEqual([['planned.dateOut', 'You leave after check-out']])
  })

  it('refuses a check-out before check-in', () => {
    expect(issues({ ...booked, provided: { ...booked.provided, dateOut: '2026-09-04' } })).toEqual([
      ['provided.dateOut', 'Check-out is before check-in'],
    ])
  })

  it('requires the property to be filled in', () => {
    expect(issues({ ...booked, place: { ...site, name: '' } })).toEqual([['place.name', 'Name is required']])
  })
})

describe('stayFromFormValues', () => {
  it('anchors each typed time to the site zone, never the device zone', () => {
    const stay = stayFromFormValues(plan('2026-09-06', '13:30', '2026-09-08', '11:00'), draft)

    expect(stay.place).toEqual(site)
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

  it('gives a site typed in by hand a custom id', () => {
    expect(stayFromFormValues({ ...booked, place: { ...site, id: '' } }, draft).place.id).toMatch(/^custom:/)
  })

  it('saves no plan when there is none', () => {
    expect(stayFromFormValues(booked, draft).stayInterval.planned).toBeUndefined()
  })

  it('saves guests, a guest name still being typed, and who reserved it as people', () => {
    const stay = stayFromFormValues({ ...booked, guestDraft: ' Jonas Weber ', reservedOn: ' Anna Weber ' }, draft)
    expect(stay.guests.map((p) => p.fullname)).toEqual(['Jonas Weber'])
    expect(stay.reservedOn).toMatchObject({ fullname: 'Anna Weber', contacts: [] })
  })

  it('saves nobody as having reserved it when the name is empty', () => {
    const stay = { ...draft, reservedOn: { id: 'p1', fullname: 'Anna Weber', contacts: [] } }
    expect(stayFromFormValues(booked, stay).reservedOn).toBeUndefined()
  })
})

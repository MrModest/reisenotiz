import { z } from 'zod'
import { schemas } from '@/lib/validations/commons'
import { convertTime, formatTo } from '@/lib/datetime'
import { findSavedPlace, stayIntervalIssues, type SavedPlaceEntry } from '@/store'
import { generateUUID, type Accommodation, type StayInterval } from '@/types'

const stayIntervalSchema = z.object({ dateIn: schemas.date, timeIn: schemas.time, dateOut: schemas.date, timeOut: schemas.time })

// Takes the saved places because a link must resolve: the site's zone is what typed times are read in
export const stayFormSchema = (places: SavedPlaceEntry[]) =>
  z
    .object({
      placeKey: z
        .string()
        .min(1, 'Property is required')
        .refine((key) => !key || findSavedPlace(places, 'AccommodationSite', key), 'Unknown place, pick the property again'),
      provided: stayIntervalSchema,
      planned: stayIntervalSchema.optional(),
      guests: z.array(schemas.person),
      // A name typed but not yet committed as a chip: it makes the form dirty and is saved with it
      guestDraft: schemas.string('Full name', 100, false),
      rooms: z.number({ message: 'Rooms is required' }).int().min(1, 'Rooms is at least 1'),
      reservedOn: schemas.string('Reserved by', 100, false),
      note: z.string(),
      attachments: z.array(schemas.attachment),
    })
    .superRefine((v, ctx) => {
      const site = findSavedPlace(places, 'AccommodationSite', v.placeKey)
      // placeKey's own refine reports a missing site; without one there is no zone to read the times in
      if (!site) return
      const stayInterval = { provided: toStayInterval(v.provided, site.tzone), planned: v.planned && toStayInterval(v.planned, site.tzone) }
      for (const { interval, end, message } of stayIntervalIssues(stayInterval)) {
        ctx.addIssue({ code: 'custom', path: [interval, end === 'in' ? 'dateIn' : 'dateOut'], message })
      }
    })

export type StayFormValues = z.infer<ReturnType<typeof stayFormSchema>>

const toStayInterval = (v: z.infer<typeof stayIntervalSchema>, zone: string): StayInterval => ({
  in: convertTime(v.dateIn, v.timeIn, zone),
  out: convertTime(v.dateOut, v.timeOut, zone),
})

const stayIntervalValues = (interval: StayInterval) => ({
  dateIn: formatTo.dateISO(interval.in),
  timeIn: formatTo.time(interval.in),
  dateOut: formatTo.dateISO(interval.out),
  timeOut: formatTo.time(interval.out),
})

export function stayFormValues(stay: Accommodation): StayFormValues {
  return {
    placeKey: stay.placeKey,
    provided: stayIntervalValues(stay.stayInterval.provided),
    planned: stay.stayInterval.planned && stayIntervalValues(stay.stayInterval.planned),
    guests: stay.guests,
    guestDraft: '',
    rooms: stay.rooms,
    reservedOn: stay.reservedOn?.fullname ?? '',
    note: stay.note,
    attachments: stay.attachments,
  }
}

const person = (fullname: string) => ({ id: generateUUID(), fullname, contacts: [] })

// Typed times are wall-clock values at the property, so each is anchored to the site's zone.
// Call only with values `stayFormSchema(places)` accepted.
export function stayFromFormValues(values: StayFormValues, stay: Accommodation, places: SavedPlaceEntry[]): Accommodation {
  const site = findSavedPlace(places, 'AccommodationSite', values.placeKey)
  if (!site) throw new Error(`No saved accommodation site ${values.placeKey}`)
  const reservedBy = values.reservedOn.trim()
  const guest = values.guestDraft.trim()

  return {
    ...stay,
    placeKey: values.placeKey,
    stayInterval: {
      provided: toStayInterval(values.provided, site.tzone),
      planned: values.planned && toStayInterval(values.planned, site.tzone),
    },
    guests: guest ? [...values.guests, person(guest)] : values.guests,
    rooms: values.rooms,
    reservedOn: reservedBy ? person(reservedBy) : undefined,
    note: values.note,
    attachments: values.attachments.map((a) => ({ ...a, tripItemId: stay.id })),
  }
}

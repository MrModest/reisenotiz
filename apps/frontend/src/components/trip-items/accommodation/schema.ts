import { z } from 'zod'
import { schemas } from '@/lib/validations/commons'
import { convertTime, formatTo } from '@/lib/datetime'
import { accommodationSiteSchema } from '@/components/places/schema'
import { stayIntervalIssues } from '@/store'
import { customPlaceId, generateUUID, type Accommodation, type StayInterval } from '@/types'

const stayIntervalSchema = z.object({ dateIn: schemas.date, timeIn: schemas.time, dateOut: schemas.date, timeOut: schemas.time })

export const stayFormSchema = z
  .object({
    place: accommodationSiteSchema,
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
    // The place's own schema reports a missing zone; without one there is nothing to read the times in
    const zone = v.place.tzone
    if (!zone) return
    const stayInterval = { provided: toStayInterval(v.provided, zone), planned: v.planned && toStayInterval(v.planned, zone) }
    for (const { interval, end, message } of stayIntervalIssues(stayInterval)) {
      ctx.addIssue({ code: 'custom', path: [interval, end === 'in' ? 'dateIn' : 'dateOut'], message })
    }
  })

export type StayFormValues = z.infer<typeof stayFormSchema>

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
    place: stay.place,
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
// A site typed in by hand gets its custom id here. Call only with values `stayFormSchema` accepted.
export function stayFromFormValues(values: StayFormValues, stay: Accommodation): Accommodation {
  const site = values.place
  const reservedBy = values.reservedOn.trim()
  const guest = values.guestDraft.trim()

  return {
    ...stay,
    place: { ...site, id: site.id || customPlaceId() },
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

import { z } from 'zod'
import { schemas } from '@/lib/validations/commons'
import { convertTime, DateTime, formatTo } from '@/lib/datetime'
import { findSavedPlace, type SavedPlaceEntry } from '@/store'
import { generateUUID, type Accommodation, type StayInterval } from '@/types'

const interval = z.object({ dateIn: schemas.date, timeIn: schemas.time, dateOut: schemas.date, timeOut: schemas.time })
const optional = <T extends z.ZodType>(s: T) => z.union([z.literal(''), s])

// Takes the saved places because a link must resolve: the site's zone is what typed times are read in
export const stayFormSchema = (places: SavedPlaceEntry[]) =>
  z
    .object({
      placeKey: z
        .string()
        .min(1, 'Property is required')
        .refine((key) => !key || findSavedPlace(places, 'AccommodationSite', key), 'Unknown place, pick the property again'),
      provided: interval,
      // All four empty means no plan
      planned: z.object({
        dateIn: optional(schemas.date),
        timeIn: optional(schemas.time),
        dateOut: optional(schemas.date),
        timeOut: optional(schemas.time),
      }),
      guests: z.array(schemas.person),
      // A name typed but not yet committed as a chip: it makes the form dirty and is saved with it
      guestDraft: schemas.string('Full name', 100, false),
      rooms: z.number({ message: 'Rooms is required' }).int().min(1, 'Rooms is at least 1'),
      reservedOn: schemas.string('Reserved by', 100, false),
      note: z.string(),
      attachments: z.array(schemas.attachment),
    })
    .superRefine((v, ctx) => {
      const issue = (path: string[], message: string) => ctx.addIssue({ code: 'custom', path, message })
      const plan = Object.values(v.planned).some(Boolean)
      if (plan) {
        for (const [field, value] of Object.entries(v.planned)) {
          if (!value) issue(['planned', field], 'Required for a plan')
        }
      }

      const site = findSavedPlace(places, 'AccommodationSite', v.placeKey)
      if (!site) return
      const provided = toInterval(v.provided, site.tzone)
      if (isBefore(provided.out, provided.in)) issue(['provided', 'dateOut'], 'Check-out is before check-in')
      if (!plan || !isComplete(v.planned)) return

      // The plan must lie within the booking, compared as instants
      const planned = toInterval(v.planned, site.tzone)
      if (isBefore(planned.in, provided.in)) issue(['planned', 'dateIn'], 'You arrive before check-in')
      if (isBefore(provided.out, planned.out)) issue(['planned', 'dateOut'], 'You leave after check-out')
      if (isBefore(planned.out, planned.in)) issue(['planned', 'dateOut'], 'You leave before you arrive')
    })

export type StayFormValues = z.infer<ReturnType<typeof stayFormSchema>>
export type IntervalValues = StayFormValues['planned']

const isBefore = (a: StayInterval['in'], b: StayInterval['in']) => DateTime.from(a).isBefore(DateTime.from(b))

export const isComplete = (v: IntervalValues): v is z.infer<typeof interval> => interval.safeParse(v).success

export const toInterval = (v: z.infer<typeof interval>, zone: string): StayInterval => ({
  in: convertTime(v.dateIn, v.timeIn, zone),
  out: convertTime(v.dateOut, v.timeOut, zone),
})

const intervalValues = (interval: StayInterval) => ({
  dateIn: formatTo.dateISO(interval.in),
  timeIn: formatTo.time(interval.in),
  dateOut: formatTo.dateISO(interval.out),
  timeOut: formatTo.time(interval.out),
})

export function stayFormValues(stay: Accommodation): StayFormValues {
  return {
    placeKey: stay.placeKey,
    provided: intervalValues(stay.stayInterval.provided),
    planned: stay.stayInterval.planned
      ? intervalValues(stay.stayInterval.planned)
      : { dateIn: '', timeIn: '', dateOut: '', timeOut: '' },
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
      provided: toInterval(values.provided, site.tzone),
      planned: isComplete(values.planned) ? toInterval(values.planned, site.tzone) : undefined,
    },
    guests: guest ? [...values.guests, person(guest)] : values.guests,
    rooms: values.rooms,
    // An unchanged name keeps the person it names
    reservedOn: !reservedBy ? undefined : reservedBy === stay.reservedOn?.fullname ? stay.reservedOn : person(reservedBy),
    note: values.note,
    attachments: values.attachments.map((a) => ({ ...a, tripItemId: stay.id })),
  }
}

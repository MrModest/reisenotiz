import { z } from 'zod'
import { schemas } from '@/lib/validations/commons'
import { Accommodation, ACCOMMODATION_SITE_KINDS } from '@/types'
import { formatTo } from '@/lib/datetime'

const stayIntervalSchema = z.object({
  dateIn: schemas.date,
  timeIn: schemas.time,

  dateOut: schemas.date,
  timeOut: schemas.time,
})

// The site is picked as a whole (selector / dialog), never field-by-field,
// so validate it as a single unit with one message instead of per-subfield errors.
const siteSchema = z
  .object({
    id: z.string().optional(),
    name: z.string(),
    kind: z.enum(ACCOMMODATION_SITE_KINDS),
    address: z.object({
      country: z.string(),
      city: z.string(),
      line: z.string().optional(),
    }),
    contact: z.string().optional(),
    tzone: schemas.timezone,
  })
  .refine(
    (site) =>
      site.name.trim().length > 0 &&
      site.address.country.trim().length > 0 &&
      site.address.city.trim().length > 0,
    { message: 'Accommodation is required' },
  )

export const accommodationFormSchema = z.object({
  site: siteSchema,
  reservedOn: schemas.string('Reserved on', 100, false).optional(),
  guests: z.number().int().optional(),
  rooms: z.number().int().optional(),
  note: z.string().trim().optional(),
  attachments: z.array(schemas.attachment).optional(),
  providedInterval: stayIntervalSchema,
  plannedInterval: stayIntervalSchema.optional(),
})

export type AccommodationStayIntervalSchema = z.infer<typeof stayIntervalSchema>

export type AccommodationFormSchema = z.infer<typeof accommodationFormSchema>

export function defaultsFromAccommodation(accomodation: Accommodation): AccommodationFormSchema {
  const { site, stayInterval } = accomodation

  return {
    site: {
      id: site.id,
      name: site.name,
      kind: site.kind,
      address: site.address,
      contact: site.contact,
      tzone: site.tzone,
    },
    reservedOn: accomodation.reservedOn,
    guests: accomodation.guests,
    rooms: accomodation.rooms,
    note: accomodation.note,
    attachments: accomodation.attachments,
    providedInterval: {
      dateIn: formatTo.dateISO(stayInterval.provided.in),
      timeIn: formatTo.time(stayInterval.provided.in),

      dateOut: formatTo.dateISO(stayInterval.provided.out),
      timeOut: formatTo.time(stayInterval.provided.out),
    },
    plannedInterval: stayInterval.planned
      ? {
          dateIn: formatTo.dateISO(stayInterval.planned.in),
          timeIn: formatTo.time(stayInterval.planned.in),

          dateOut: formatTo.dateISO(stayInterval.planned.out),
          timeOut: formatTo.time(stayInterval.planned.out),
        }
      : undefined,
  }
}

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

export const accommodationFormSchema = z.object({
  siteId: z.string().optional(),
  siteName: schemas.string('Name', 200),
  siteKind: z.enum(ACCOMMODATION_SITE_KINDS),
  siteAddress: schemas.address,
  siteContact: z.string().optional(),
  siteTzone: schemas.timezone,
  reservedOn: schemas.string('Reserved on', 100, false).optional(),
  guests: z.number().int().optional(),
  rooms: z.number().int().optional(),
  note: z.string().trim().optional(),
  attachments: z.array(schemas.attachment).optional(),
  providedInterval: stayIntervalSchema,
  plannedInterval: stayIntervalSchema.optional(),
})

export type AccommodationFormSchema = z.infer<typeof accommodationFormSchema>

export function defaultsFromAccommodation(accomodation: Accommodation): AccommodationFormSchema {
  const { site, stayInterval } = accomodation

  return {
    siteId: site.id,
    siteName: site.name,
    siteKind: site.kind,
    siteAddress: site.address,
    siteContact: site.contact,
    siteTzone: site.tzone,
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
    plannedInterval: stayInterval.planned ? {
      dateIn: formatTo.dateISO(stayInterval.planned.in),
      timeIn: formatTo.time(stayInterval.planned.in),

      dateOut: formatTo.dateISO(stayInterval.planned.out),
      timeOut: formatTo.time(stayInterval.planned.out),
    } : undefined,
  }
}

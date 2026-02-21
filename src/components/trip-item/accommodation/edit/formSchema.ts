import { z } from 'zod'
import { schemas } from '@/lib/validations/commons'
import { Accommodation, ACCOMMODATION_SITE_KINDS } from '@/types'
import { formatTo } from '@/lib/datetime'

const reservationPointSchema = z.object({
  tzone: schemas.timezone,
  availableDate: schemas.date,
  availableTime: schemas.time,
  plannedDate: schemas.date.optional(),
  plannedTime: schemas.time.optional(),
})

export const accommodationFormSchema = z.object({
  siteName: schemas.string('Name', 200),
  siteKind: z.enum(ACCOMMODATION_SITE_KINDS),
  siteAddress: schemas.address,
  siteContact: z.string().optional(),
  reservedOn: schemas.string('Reserved on', 100, false).optional(),
  guests: z.number().int().optional(),
  rooms: z.number().int().optional(),
  note: z.string().trim().optional(),
  attachments: z.array(schemas.attachment).optional(),
  checkIn: reservationPointSchema,
  checkOut: reservationPointSchema,
})

export type AccommodationFormSchema = z.infer<typeof accommodationFormSchema>

export function defaultsFromAccommodation(acc: Accommodation): AccommodationFormSchema {
  const { site, reservation } = acc

  return {
    siteName: site.name,
    siteKind: site.kind,
    siteAddress: site.address,
    siteContact: site.contact,
    reservedOn: acc.reservedOn,
    guests: acc.guests,
    rooms: acc.rooms,
    note: acc.note,
    attachments: acc.attachments,
    checkIn: {
      tzone: reservation.checkIn.available.zone,
      availableDate: formatTo.dateISO(reservation.checkIn.available),
      availableTime: formatTo.time(reservation.checkIn.available),
      plannedDate: reservation.checkIn.planned ? formatTo.dateISO(reservation.checkIn.planned) : undefined,
      plannedTime: reservation.checkIn.planned ? formatTo.time(reservation.checkIn.planned) : undefined,
    },
    checkOut: {
      tzone: reservation.checkOut.available.zone,
      availableDate: formatTo.dateISO(reservation.checkOut.available),
      availableTime: formatTo.time(reservation.checkOut.available),
      plannedDate: reservation.checkOut.planned ? formatTo.dateISO(reservation.checkOut.planned) : undefined,
      plannedTime: reservation.checkOut.planned ? formatTo.time(reservation.checkOut.planned) : undefined,
    },
  }
}

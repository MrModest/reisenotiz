import { z } from 'zod'
import { schemas } from '@/lib/validations/commons'
import { Accommodation, ACCOMMODATION_SITE_KINDS } from '@/types'
import { formatTo } from '@/lib/datetime'

const reservationPointSchema = z.object({
  tzone: z.string().min(1, 'Timezone is required'),
  availableDate: schemas.date,
  availableTime: schemas.time,
  plannedDate: schemas.date.optional(),
  plannedTime: schemas.time.optional(),
})

export const accommodationFormSchema = z.object({
  siteName: z.string().min(1, 'Name is required'),
  siteKind: z.enum(ACCOMMODATION_SITE_KINDS),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  addressLine: z.string().optional(),
  contact: z.string().optional(),
  reservedOn: z.string().optional(),
  guests: z.preprocess(Number, z.number().int().min(1, 'At least 1 guest')),
  rooms: z.preprocess(Number, z.number().int().min(1, 'At least 1 room')),
  note: z.string().optional(),
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
    country: site.address.country,
    city: site.address.city,
    addressLine: site.address.line,
    contact: acc.contact,
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

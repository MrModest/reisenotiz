import { z } from 'zod'
import { schemas } from '@/lib/validations/commons'
import { convertTime, formatTo } from '@/lib/datetime'
import { airportSchema } from '@/components/places/schema'
import { customPlaceId, generateUUID, type Flight, type FlightPoint } from '@/types'

const point = z.object({
  place: airportSchema,
  date: schemas.date,
  time: schemas.time,
  terminal: z.string(),
  gate: z.string(),
})

export const flightFormSchema = z.object({
  flightNumber: z.string(),
  carrier: z.string(),
  departure: point,
  arrival: point,
  bookingCode: z.string(),
  seat: z.string(),
  passengers: z.array(schemas.person),
  // A name typed but not yet committed as a chip: it makes the form dirty and is saved with it
  passengerDraft: schemas.string('Full name', 100, false),
  note: z.string(),
  attachments: z.array(schemas.attachment),
})

export type FlightFormValues = z.infer<typeof flightFormSchema>
type FlightPointValues = FlightFormValues['departure']

const pointValues = (point: FlightPoint): FlightPointValues => ({
  place: point.place,
  date: formatTo.dateISO(point.time),
  time: formatTo.time(point.time),
  terminal: point.terminal ?? '',
  gate: point.gate ?? '',
})

export function flightFormValues(flight: Flight): FlightFormValues {
  return {
    flightNumber: flight.flightNumber,
    carrier: flight.carrier,
    departure: pointValues(flight.departure),
    arrival: pointValues(flight.arrival),
    bookingCode: flight.bookingCode,
    seat: flight.seat,
    passengers: flight.passengers,
    passengerDraft: '',
    note: flight.note,
    attachments: flight.attachments,
  }
}

// Typed times are wall-clock values at the airport, so each is anchored to its airport's zone.
// An airport typed in by hand gets its custom id here. Call only with values `flightFormSchema` accepted.
export function flightFromFormValues(values: FlightFormValues, flight: Flight): Flight {
  const point = (v: FlightPointValues): FlightPoint => ({
    place: { ...v.place, id: v.place.id || customPlaceId() },
    terminal: v.terminal,
    gate: v.gate,
    time: convertTime(v.date, v.time, v.place.tzone),
  })

  return {
    ...flight,
    flightNumber: values.flightNumber,
    carrier: values.carrier,
    departure: point(values.departure),
    arrival: point(values.arrival),
    bookingCode: values.bookingCode,
    seat: values.seat,
    passengers: values.passengerDraft.trim()
      ? [...values.passengers, { id: generateUUID(), fullname: values.passengerDraft.trim(), contacts: [] }]
      : values.passengers,
    note: values.note,
    attachments: values.attachments.map((a) => ({ ...a, tripItemId: flight.id })),
  }
}

import { z } from 'zod'
import { schemas } from '@/lib/validations/commons'
import { convertTime, formatTo } from '@/lib/datetime'
import { findSavedPlace, type SavedPlaceEntry } from '@/store'
import type { Flight, FlightPoint } from '@/types'

const flightPointSchema = z.object({
  placeKey: z.string().min(1, 'Airport is required'),
  date: schemas.date,
  time: schemas.time,
  terminal: z.string(),
  gate: z.string(),
})

export const flightFormSchema = z.object({
  flightNumber: z.string(),
  carrier: z.string(),
  departure: flightPointSchema,
  arrival: flightPointSchema,
  bookingCode: z.string(),
  seat: z.string(),
  passengers: z.array(schemas.person),
  note: z.string(),
  attachments: z.array(schemas.attachment),
})

export type FlightFormValues = z.infer<typeof flightFormSchema>
type FlightPointValues = FlightFormValues['departure']

const pointValues = (point: FlightPoint): FlightPointValues => ({
  placeKey: point.placeKey,
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
    note: flight.note,
    attachments: flight.attachments,
  }
}

// Typed times are wall-clock values at the airport, so each is anchored to its airport's zone.
// A link that dangles keeps the zone the point had.
export function flightFromFormValues(values: FlightFormValues, flight: Flight, places: SavedPlaceEntry[]): Flight {
  const point = (v: FlightPointValues, before: FlightPoint): FlightPoint => {
    const zone = findSavedPlace(places, 'Airport', v.placeKey)?.tzone ?? before.time.zone
    return { placeKey: v.placeKey, terminal: v.terminal, gate: v.gate, time: convertTime(v.date, v.time, zone) }
  }

  return {
    ...flight,
    flightNumber: values.flightNumber,
    carrier: values.carrier,
    departure: point(values.departure, flight.departure),
    arrival: point(values.arrival, flight.arrival),
    bookingCode: values.bookingCode,
    seat: values.seat,
    passengers: values.passengers,
    note: values.note,
    attachments: values.attachments.map((a) => ({ ...a, tripItemId: flight.id })),
  }
}

import { z } from 'zod'
import { schemas } from '@/lib/validations/commons'
import { convertTime, formatTo } from '@/lib/datetime'
import { findSavedPlace, type SavedPlaceEntry } from '@/store'
import { generateUUID, type Flight, type FlightPoint } from '@/types'

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
  // A name typed but not yet committed as a chip: it makes the form dirty and is saved with it
  passengerDraft: schemas.string('Full name', 100, false),
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
    passengerDraft: '',
    note: flight.note,
    attachments: flight.attachments,
  }
}

type Point = 'departure' | 'arrival'
const points: Point[] = ['departure', 'arrival']

// The airport's own zone; a link left unchanged that dangles keeps the zone the point had
function airportZone(v: FlightPointValues, before: FlightPoint, places: SavedPlaceEntry[]): string | undefined {
  return findSavedPlace(places, 'Airport', v.placeKey)?.tzone ?? (v.placeKey === before.placeKey ? before.time.zone : undefined)
}

// Points whose time has no zone to be read in: a newly picked airport deleted before submit
export function unresolvedAirports(values: FlightFormValues, flight: Flight, places: SavedPlaceEntry[]): Point[] {
  return points.filter((p) => !airportZone(values[p], flight[p], places))
}

// Typed times are wall-clock values at the airport, so each is anchored to its airport's zone.
// Call only once `unresolvedAirports` is empty.
export function flightFromFormValues(values: FlightFormValues, flight: Flight, places: SavedPlaceEntry[]): Flight {
  const point = (v: FlightPointValues, before: FlightPoint): FlightPoint => {
    const zone = airportZone(v, before, places)
    if (!zone) throw new Error(`No zone for airport ${v.placeKey}`)
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
    passengers: values.passengerDraft.trim()
      ? [...values.passengers, { id: generateUUID(), fullname: values.passengerDraft.trim(), contacts: [] }]
      : values.passengers,
    note: values.note,
    attachments: values.attachments.map((a) => ({ ...a, tripItemId: flight.id })),
  }
}

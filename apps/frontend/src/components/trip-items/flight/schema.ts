import { z } from 'zod'
import { schemas } from '@/lib/validations/commons'
import { convertTime, formatTo } from '@/lib/datetime'
import { findSavedPlace, type SavedPlaceEntry } from '@/store'
import { generateUUID, type Flight, type FlightPoint } from '@/types'

// Takes the saved places because a link must resolve: the airport's zone is what typed times are read in
export const flightFormSchema = (places: SavedPlaceEntry[]) => {
  const point = z.object({
    placeKey: z
      .string()
      .min(1, 'Airport is required')
      .refine((key) => !key || findSavedPlace(places, 'Airport', key), 'Unknown place, pick the airport again'),
    date: schemas.date,
    time: schemas.time,
    terminal: z.string(),
    gate: z.string(),
  })

  return z.object({
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
}

export type FlightFormValues = z.infer<ReturnType<typeof flightFormSchema>>
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

// Typed times are wall-clock values at the airport, so each is anchored to its airport's zone.
// Call only with values `flightFormSchema(places)` accepted.
export function flightFromFormValues(values: FlightFormValues, flight: Flight, places: SavedPlaceEntry[]): Flight {
  const point = (v: FlightPointValues): FlightPoint => {
    const airport = findSavedPlace(places, 'Airport', v.placeKey)
    if (!airport) throw new Error(`No saved airport ${v.placeKey}`)
    return { placeKey: v.placeKey, terminal: v.terminal, gate: v.gate, time: convertTime(v.date, v.time, airport.tzone) }
  }

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

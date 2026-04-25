import { z } from 'zod'
import { schemas } from '@/lib/validations/commons'
import { Flight } from '@/types'
import { formatTo } from '@/lib/datetime'

const airportSchema = z.object({
  code: schemas.airportCode,
  name: z.string().min(1, 'Airport name is required'),
  address: schemas.address,
  tzone: schemas.timezone,
})

const flightPointSchema = z.object({
  airport: airportSchema,
  terminal: z.string().optional(),
  gate: z.string().optional(),
  date: schemas.date,
  time: schemas.time,
})

export const flightFormSchema = z.object({
  flightNumber: z.string().optional(),
  carrier: z.string().optional(),
  bookingCode: z.string().optional(),
  seat: z.string().optional(),
  note: z.string().optional(),
  passengers: z.array(schemas.person).optional(),
  attachments: z.array(schemas.attachment).optional(),
  departure: flightPointSchema,
  arrival: flightPointSchema,
})

export type FlightFormSchema = z.infer<typeof flightFormSchema>

export function defaultsFromFlight(flight: Flight): FlightFormSchema {
  return {
    flightNumber: flight.flightNumber,
    carrier: flight.carrier,
    bookingCode: flight.bookingCode,
    seat: flight.seat,
    note: flight.note,
    passengers: flight.passengers,
    attachments: flight.attachments,
    departure: {
      airport: flight.departure.airport,
      terminal: flight.departure.terminal,
      gate: flight.departure.gate,
      date: formatTo.dateISO(flight.departure.time),
      time: formatTo.time(flight.departure.time),
    },
    arrival: {
      airport: flight.arrival.airport,
      terminal: flight.arrival.terminal,
      gate: flight.arrival.gate,
      date: formatTo.dateISO(flight.arrival.time),
      time: formatTo.time(flight.arrival.time),
    },
  }
}

import { z } from 'zod'
import { schemas } from '@/lib/validations/commons'

const airportSchema = z.object({
  code: z.string().min(3, 'Airport code must be at least 3 characters').max(4),
  name: z.string().min(1, 'Airport name is required'),
  address: schemas.address.optional(),
  tzone: z.string().optional()
})

const flightPointSchema = z.object({
  airport: airportSchema,
  terminal: z.string().optional(),
  gate: z.string().optional(),
  date: schemas.date,
  time: schemas.time,
  timezone: schemas.timezone
})

export const flightFormSchema = z.object({
  flightNumber: z.string().optional(),
  carrier: z.string().optional(),
  bookingCode: z.string().optional(),
  seat: z.string().optional(),
  passengers: z.array(schemas.person).optional(),
  departure: flightPointSchema,
  arrival: flightPointSchema
})

export type FlightFormValues = z.infer<typeof flightFormSchema>

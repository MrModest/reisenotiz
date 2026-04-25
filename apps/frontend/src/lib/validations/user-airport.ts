import { z } from 'zod'
import { schemas } from './commons'

export const userAirportSchema = z.object({
  code: schemas.airportCode,
  name: z.string().min(1, 'Name is required'),
  address: schemas.address,
  tzone: schemas.timezone,
})

export type UserAirportSchema = z.infer<typeof userAirportSchema>

import { z } from 'zod'
import { schemas } from '@/lib/validations/commons'
import { ACCOMMODATION_SITE_KINDS } from '@/types'

const placeShape = {
  name: schemas.string('Name', 100),
  address: schemas.address,
  tzone: schemas.timezone,
}

export const airportSchema = z.object({
  ...placeShape,
  code: schemas.airportCode,
})

export const accommodationSiteSchema = z.object({
  ...placeShape,
  kind: z.enum(ACCOMMODATION_SITE_KINDS),
  contact: schemas.string('Contact', 100, false).optional(),
})

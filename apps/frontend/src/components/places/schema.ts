import { z } from 'zod'
import { schemas } from '@/lib/validations/commons'
import { ACCOMMODATION_SITE_KINDS } from '@/types'

const placeShape = {
  // Empty on a place typed in by hand; the form gives it a custom id on submit
  id: z.string(),
  name: schemas.string('Name', 100),
  address: schemas.address,
  tzone: schemas.timezone,
}

export const airportSchema = z.object({
  ...placeShape,
  type: z.literal('Airport'),
  code: schemas.airportCode,
})

export const accommodationSiteSchema = z.object({
  ...placeShape,
  type: z.literal('AccommodationSite'),
  kind: z.enum(ACCOMMODATION_SITE_KINDS),
  contact: schemas.string('Contact', 100, false).optional(),
})

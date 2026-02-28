import { z } from 'zod'
import { schemas } from './commons'
import { ACCOMMODATION_SITE_KINDS } from '@/types'

export const userAccommodationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  kind: z.enum(ACCOMMODATION_SITE_KINDS),
  address: schemas.address,
  contact: z.string().optional(),
})

export type UserAccommodationSchema = z.infer<typeof userAccommodationSchema>

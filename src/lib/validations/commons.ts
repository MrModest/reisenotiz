import { z } from 'zod'

const geoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
})

const addressSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  line: z.string().optional(),
  geoPoint: geoPointSchema.optional()
})

const personSchema = z.object({
  id: z.string().min(1),
  fullname: z.string().min(1, 'Full name is required'),
  contacts: z.array(z.string())
})

const attachmentSchema = z.object({
  id: z.string(),
  link: z.string().min(1, 'Link is required'),
  name: z.string().min(1, 'Name is required'),
  note: z.string().optional()
})

const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')

const timeSchema = z.string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format (24-hour)')

const timezoneSchema = z.string()
  .regex(/^[A-Z][a-z]+\/[A-Z][a-z_]+$/, 'Timezone must be a valid IANA timezone (e.g., America/Los_Angeles)')

const airportCodeSchema = z.string()
  .min(3, 'Code must be 3-4 characters')
  .max(4, 'Code must be 3-4 characters')
  .transform((v) => v.toUpperCase())

export const schemas = {
  geoPoint: geoPointSchema,
  address: addressSchema,
  person: personSchema,
  attachment: attachmentSchema,
  date: dateSchema,
  time: timeSchema,
  timezone: timezoneSchema,
  airportCode: airportCodeSchema
}
export type GeoPointSchema = z.infer<typeof geoPointSchema>
export type AddressSchema = z.infer<typeof addressSchema>
export type PersonSchema = z.infer<typeof personSchema>
export type DateStringSchema = z.infer<typeof dateSchema>
export type TimeStringSchema = z.infer<typeof timeSchema>
export type TimezoneStringSchema = z.infer<typeof timezoneSchema>

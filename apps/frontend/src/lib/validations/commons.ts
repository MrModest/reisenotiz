import { z } from 'zod'

function stringSchema(fieldName: string, max?: number, required: boolean = true, trim: boolean = true) {
  let s = z.string()
  if (trim) {
    s = s.trim()
  }
  if (required) {
    s = s.min(1, `${fieldName} is required`)
  }
  if (max !== undefined) {
    s = s.max(max, `${fieldName} is longer than ${max} characters`)
  }

  return s
}

const geoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

const addressSchema = z.object({
  country: stringSchema('Country', 100),
  city: stringSchema('City', 100),
  line: stringSchema('Address line', 200, false).optional(),
})

const personSchema = z.object({
  id: z.string().min(1),
  fullname: z.string().min(1, 'Full name is required'),
  contacts: z.array(z.string()),
})

const attachmentSchema = z.object({
  id: z.string(),
  link: z.string().min(1, 'Link is required'),
  name: z.string().min(1, 'Name is required'),
  note: z.string().optional(),
})

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format (24-hour)')

const timezoneSchema = z
  .string()
  .min(1, 'Timezone is required')
  .refine((val) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: val })
      return true
    } catch {
      return false
    }
  }, 'Invalid timezone (e.g., Europe/Berlin, UTC, America/New_York)')

const airportCodeSchema = z
  .string()
  .min(3, 'Code must be 3-4 characters')
  .max(4, 'Code must be 3-4 characters')
  .transform((v) => v.toUpperCase())

export const schemas = {
  string: stringSchema,
  geoPoint: geoPointSchema,
  address: addressSchema,
  person: personSchema,
  attachment: attachmentSchema,
  date: dateSchema,
  time: timeSchema,
  timezone: timezoneSchema,
  airportCode: airportCodeSchema,
}
export type GeoPointSchema = z.infer<typeof geoPointSchema>
export type AddressSchema = z.infer<typeof addressSchema>
export type PersonSchema = z.infer<typeof personSchema>
export type DateStringSchema = z.infer<typeof dateSchema>
export type TimeStringSchema = z.infer<typeof timeSchema>
export type TimezoneStringSchema = z.infer<typeof timezoneSchema>

import { z } from 'zod'
import { DateTime, formatTo } from '@/lib/datetime'
import { schemas } from '@/lib/validations/commons'
import type { Trip } from '@/types'

export const tripFormSchema = z
  .object({
    name: schemas.string('Name', 100),
    description: z.string(),
    startDate: schemas.date,
    endDate: schemas.date,
  })
  // ISO dates compare correctly as strings
  .refine((v) => v.endDate >= v.startDate, { path: ['endDate'], message: 'End date is before the start date' })

export type TripFormValues = z.infer<typeof tripFormSchema>

export function tripFormValues(trip: Trip): TripFormValues {
  return {
    name: trip.name,
    description: trip.description,
    startDate: formatTo.dateISO(trip.startDate),
    endDate: formatTo.dateISO(trip.endDate),
  }
}

// Each date becomes the start of that day in `zone`
export function tripFromFormValues(values: TripFormValues, zone: string): Omit<Trip, 'id'> {
  const atStartOfDay = (iso: string) => {
    const [year, month, day] = iso.split('-').map(Number)
    return DateTime.fromObject({ year, month, day }, zone).toZonedInstant()
  }
  return {
    name: values.name,
    description: values.description,
    startDate: atStartOfDay(values.startDate),
    endDate: atStartOfDay(values.endDate),
  }
}

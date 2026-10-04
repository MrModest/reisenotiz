import { z } from 'zod'
import { formatTo } from '@/lib/datetime'
import { convertTime } from '@/components/trip-items/shared/utils'
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
  return {
    name: values.name,
    description: values.description,
    startDate: convertTime(values.startDate, '00:00', zone),
    endDate: convertTime(values.endDate, '00:00', zone),
  }
}

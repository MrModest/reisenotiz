import { DateTime } from '@/lib/datetime'
import type { Accommodation, StayInterval, TripItem } from '@/types'

const isBefore = (a: StayInterval['in'], b: StayInterval['in']) => DateTime.from(a).isBefore(DateTime.from(b))

// A dangling placeKey is allowed: deleting a saved site leaves its stays pointing at it
function stayViolation({ placeKey, stayInterval: { provided, planned } }: Accommodation): string | undefined {
  if (!placeKey) return 'no property'
  if (isBefore(provided.out, provided.in)) return 'check-out is before check-in'
  if (!planned) return undefined
  if (isBefore(planned.out, planned.in)) return 'the plan leaves before it arrives'
  if (isBefore(planned.in, provided.in) || isBefore(provided.out, planned.out)) return 'the plan lies outside the booking'
}

export function assertValidTripItem(item: Omit<TripItem, 'id'>): void {
  const violation = item.type === 'Accommodation' ? stayViolation(item as Accommodation) : undefined
  if (violation) throw new Error(`Invalid ${item.type}: ${violation}`)
}

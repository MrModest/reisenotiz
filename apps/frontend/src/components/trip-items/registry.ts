import type { Accommodation, Flight, TripItemType } from '@/types'
import type { TripItemModule } from './module'
import { accommodationModule } from './accommodation/module'
import { flightModule } from './flight/module'

const registry: { [K in TripItemType]: TripItemModule<Extract<Flight | Accommodation, { type: K }>> } = {
  Flight: flightModule,
  Accommodation: accommodationModule,
}

// Widened to the base TripItem: a module is only ever handed items of its own type,
// because every lookup is by that type.
export const tripItemModules = Object.values(registry) as unknown as TripItemModule[]

export function getTripItemModule(type: string): TripItemModule | undefined {
  return Object.prototype.hasOwnProperty.call(registry, type) ? (registry[type as TripItemType] as unknown as TripItemModule) : undefined
}

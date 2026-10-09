import type { Accommodation, Flight, TripItem, TripItemType } from '@/types'
import type { TimelineElement } from '@/lib/timeline'
import type { SavedPlaceEntry } from '@/store'
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

/** The modules of the types present in `items`, in registry order. Unknown types are left out. */
export function presentTripItemModules(items: TripItem[]): TripItemModule[] {
  return tripItemModules.filter((m) => items.some((i) => i.type === m.type))
}

/** Every timeline element of `items`. Items of a type this build does not know have none. */
export function toTimelineElements(items: TripItem[], places: SavedPlaceEntry[]): TimelineElement[] {
  return items.flatMap((item) => getTripItemModule(item.type)?.toTimelineElements(item, places) ?? [])
}

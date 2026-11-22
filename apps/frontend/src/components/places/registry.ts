import type { AnyPlace, PlaceType, PlaceTypes } from '@/types'
import type { PlaceTypeModule } from './module'
import { accommodationSiteModule } from './accommodation-site'
import { airportModule } from './airport'

const registry: { [K in PlaceType]: PlaceTypeModule<PlaceTypes[K]> } = {
  Airport: airportModule,
  AccommodationSite: accommodationSiteModule,
}

// In display order: the Places screen's chips follow it
export const placeTypeModules = Object.values(registry) as unknown as PlaceTypeModule[]

export function getPlaceTypeModule<T extends PlaceType>(type: T): PlaceTypeModule<PlaceTypes[T]> {
  return registry[type] as unknown as PlaceTypeModule<PlaceTypes[T]>
}

// The short line beside any place's name, whatever its type
export function placeMeta(place: AnyPlace): string {
  return (getPlaceTypeModule(place.type) as unknown as PlaceTypeModule).meta(place)
}

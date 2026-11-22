import { rankPlaces } from '@/lib/places/search'
import type { PlaceType, PlaceTypes } from '@/types'
import { airportDictionary } from '../dictionaries'

// Places from outside sources, each with its source's id. Callers never learn which source answered.
export interface PlaceProvider {
  search<T extends PlaceType>(type: T, query: string): Promise<PlaceTypes[T][]>
}

const sources: { [K in PlaceType]?: (query: string) => Promise<PlaceTypes[K][]> } = {
  Airport: async (query) => rankPlaces(Object.values(airportDictionary.getAll()), query),
}

export const placeProvider: PlaceProvider = {
  search: async (type, query) => (await sources[type]?.(query)) ?? [],
}

import { useMemo } from 'react'
import { useSavedPlaces } from '@/store'
import { airportDictionary } from '@/services'
import type { Airport } from '@/types'

// What the airport picker offers: saved airports that are not archived, then the dictionary's
// airports that are not saved at all. Picking one of the latter materialises it.
export function useAirports(): Airport[] {
  const places = useSavedPlaces()
  const dictionary = airportDictionary.getAll()
  return useMemo(() => {
    const saved = new Map(places.flatMap((e) => (e.type === 'Airport' ? [[e.key, e.place] as const] : [])))
    return [
      ...[...saved.values()].filter((airport) => !airport.archived),
      ...Object.values(dictionary).filter((airport) => !saved.has(airport.code)),
    ]
  }, [places, dictionary])
}

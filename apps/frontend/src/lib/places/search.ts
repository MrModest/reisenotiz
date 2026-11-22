import { countryName } from '@/services/dictionaries'
import type { AnyPlace, PlaceType, PlaceTypes } from '@/types'

export const MIN_QUERY_LENGTH = 2
const MAX_RESULTS = 50

// What a query is matched against, most telling first
const searchFields: { [K in PlaceType]: (place: PlaceTypes[K]) => string[] } = {
  Airport: (airport) => [airport.code, airport.name, airport.address.city, countryName(airport.address.countryCode)],
  AccommodationSite: (site) => [site.name],
}

const normalise = (query: string) => query.trim().toLowerCase()

// An earlier field outranks a later one; within a field, a prefix outranks a match inside it. 0 is no match.
function scorePlace(place: AnyPlace, q: string): number {
  const fields = (searchFields[place.type] as (place: AnyPlace) => string[])(place)
  let best = 0
  fields.forEach((field, i) => {
    const value = field.toLowerCase()
    const weight = 2 * (fields.length - i)
    if (value.startsWith(q)) best = Math.max(best, weight)
    else if (value.includes(q)) best = Math.max(best, weight - 1)
  })
  return best
}

// Highest score first; `sort` is stable, so equal scores keep the order they came in
function byScore<T extends AnyPlace>(scored: { place: T; score: number }[]): T[] {
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map((s) => s.place)
}

// The places that match `query`, best match first
export function rankPlaces<T extends AnyPlace>(places: T[], query: string): T[] {
  const q = normalise(query)
  if (q.length < MIN_QUERY_LENGTH) return []
  return byScore(places.map((place) => ({ place, score: scorePlace(place, q) })).filter((s) => s.score > 0))
}

// The selector's list: the saved places that match, and every provider result, since the provider
// already decided those match. All ranked together; a saved place and a provider result for the
// same place both appear.
export function placeSuggestions<T extends AnyPlace>(saved: T[], providerResults: T[], query: string): T[] {
  const q = normalise(query)
  if (q.length < MIN_QUERY_LENGTH) return []
  return byScore([
    ...saved.map((place) => ({ place, score: scorePlace(place, q) })).filter((s) => s.score > 0),
    ...providerResults.map((place) => ({ place, score: scorePlace(place, q) })),
  ])
}

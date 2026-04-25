import type { AccommodationSite, Airport } from '@/types'
import { parseAirports } from './parse-airports'
import { Dictionary } from './service'

const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export const airportDictionary = new Dictionary<Airport>({
  storageKey: 'dict:airports',
  fetcher: () => parseAirports(),
  maxAgeMs: DEFAULT_MAX_AGE_MS,
})

export const accommodationDictionary = new Dictionary<AccommodationSite>({
  storageKey: 'dict:accommodations',
  fetcher: async () => {
    // Placeholder: Replace with real data fetching logic
    return {}
  },
  maxAgeMs: DEFAULT_MAX_AGE_MS,
})

import type { Airport } from '@/types'
import { parseAirports, parseCountries } from './parse'
import { Dictionary } from './service'
import type { Country } from './types'

const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

async function fetchText(path: string): Promise<string> {
  const response = await fetch(path)
  return response.text()
}

export const countryDictionary = new Dictionary<Country>({
  storageKey: 'dict:countries',
  fetcher: async () => parseCountries(await fetchText('/dicts/countries.csv')),
  maxAgeMs: DEFAULT_MAX_AGE_MS,
})

export const airportDictionary = new Dictionary<Airport>({
  storageKey: 'dict:airports-by-country-code',
  fetcher: async () => {
    await countryDictionary.load()
    const codeByName = Object.fromEntries(countryDictionary.getAllValues().map((c) => [c.name, c.code]))
    return parseAirports(await fetchText('/dicts/airports.csv'), codeByName)
  },
  maxAgeMs: DEFAULT_MAX_AGE_MS,
})

// An unmapped code means a place was written without the dropdown, which is a bug.
export function countryName(code: string): string {
  const country = countryDictionary.get(code)
  if (!country) throw new Error(`Unknown country code '${code}'`)
  return country.name
}

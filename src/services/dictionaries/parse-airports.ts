import type { Airport } from '@/types'
import airportsCsv from './data/airports.csv?raw'
import countriesCsv from './data/countries.csv?raw'

// Can be replaced with a library like 'papaparse' if the CSV format gets more complex
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

export function parseCountries(): Record<string, string> {
  const lines = countriesCsv.trim().split('\n')
  const headers = parseCsvLine(lines[0])
  const idx = (col: string) => headers.indexOf(col)

  const result: Record<string, string> = {}

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    const countryCode = values[idx('code')]
    const countryName = values[idx('name')]
    if (countryCode && countryName && !result[countryCode]) {
      result[countryCode] = countryName
    }
  }

  return result
}

export function parseAirports(): Record<string, Airport> {
  const lines = airportsCsv.trim().split('\n')
  const headers = parseCsvLine(lines[0])
  const idx = (col: string) => headers.indexOf(col)

  const countryMap = parseCountries()

  const result: Record<string, Airport> = {}

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])

    const code = values[idx('iata_code')]
    const name = values[idx('name')]
    if (!code || !name) continue

    const lat = parseFloat(values[idx('latitude_deg')])
    const lon = parseFloat(values[idx('longitude_deg')])

    const country = countryMap[values[idx('iso_country')]] || values[idx('iso_country')]

    result[code] = {
      code,
      name,
      address: {
        country: country ?? '',
        city: values[idx('municipality')] ?? '',
        line: '',
        ...(Number.isFinite(lat) && Number.isFinite(lon)
          ? { geoPoint: { latitude: lat, longitude: lon } }
          : {}),
      },
      tzone: values[idx('time_zone')] ?? 'UTC',
    }
  }

  return result
}

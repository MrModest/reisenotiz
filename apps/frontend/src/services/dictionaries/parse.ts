import type { Airport } from '@/types'
import type { Country } from './types'

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

export function parseCountries(csv: string): Record<string, Country> {
  const lines = csv.trim().split('\n')
  const headers = parseCsvLine(lines[0])
  const idx = (col: string) => headers.indexOf(col)

  const result: Record<string, Country> = {}

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    const code = values[idx('code')]
    const name = values[idx('name')]
    if (code && name && !result[code]) {
      result[code] = { code, name }
    }
  }

  return result
}

// The CSV names each airport's country; the app stores its ISO code. Every name in `airports.csv`
// maps, so a miss means the two files drifted apart.
export function parseAirports(csv: string, countryCodeByName: Record<string, string>): Record<string, Airport> {
  const lines = csv.trim().split('\n')
  const headers = parseCsvLine(lines[0])
  const idx = (col: string) => headers.indexOf(col)

  const result: Record<string, Airport> = {}

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])

    const code = values[idx('iata')]
    const name = values[idx('name')]
    if (!code || !name) continue

    const country = values[idx('country')]
    const countryCode = countryCodeByName[country]
    if (!countryCode) throw new Error(`Airport ${code} is in '${country}', which the country list lacks`)

    result[code] = {
      code,
      name,
      address: {
        line: '',
        city: values[idx('city')],
        countryCode,
        geoPoint: {
          latitude: parseFloat(values[idx('latitude')]),
          longitude: parseFloat(values[idx('longitude')]),
        },
      },
      tzone: values[idx('timezone')] ?? 'Etc/Utc',
    }
  }

  return result
}

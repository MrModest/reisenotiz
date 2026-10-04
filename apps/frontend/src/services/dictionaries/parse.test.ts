import { describe, it, expect } from 'vitest'
import { parseAirports, parseCountries } from './parse'

const countriesCsv = 'code,name\nDE,Germany\nJP,Japan\n'
const airportsCsv = [
  'iata,name,city,country,latitude,longitude,timezone',
  'BER,Berlin Brandenburg Airport,Berlin,Germany,52.36,13.50,Europe/Berlin',
  'HND,"Tokyo Haneda Airport, Ota",Tokyo,Japan,35.55,139.78,Asia/Tokyo',
].join('\n')

describe('parseCountries', () => {
  it('keys each country by its ISO code', () => {
    expect(parseCountries(countriesCsv)).toEqual({
      DE: { code: 'DE', name: 'Germany' },
      JP: { code: 'JP', name: 'Japan' },
    })
  })
})

describe('parseAirports', () => {
  it('stores the country of each airport as its ISO code', () => {
    const airports = parseAirports(airportsCsv, { Germany: 'DE', Japan: 'JP' })

    expect(airports.BER.address.countryCode).toBe('DE')
    expect(airports.HND).toMatchObject({ name: 'Tokyo Haneda Airport, Ota', address: { countryCode: 'JP', city: 'Tokyo' } })
  })

  it('throws on a country name the country list lacks', () => {
    expect(() => parseAirports(airportsCsv, { Germany: 'DE' })).toThrow(/Japan/)
  })
})

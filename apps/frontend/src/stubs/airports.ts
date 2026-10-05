import { Airport } from '@/types'

export const airports: Airport[] = [
  {
    code: 'BER',
    name: 'Berlin Brandenburg Airport',
    address: {
      line: 'Willy-Brandt-Platz 1, 12529 Schönefeld',
      city: 'Schönefeld',
      countryCode: 'DE',
      geoPoint: {
        latitude: 52.361738,
        longitude: 13.502341,
      },
    },
    tzone: 'Europe/Berlin',
  },
  {
    code: 'HND',
    name: 'Tokyo Haneda Airport',
    address: {
      line: 'Haneda Airport, 144-0041 Ota City, Tokyo',
      city: 'Tokyo',
      countryCode: 'JP',
    },
    tzone: 'Asia/Tokyo',
  },
  {
    code: 'FRA',
    name: 'Frankfurt Airport',
    address: {
      line: '60547 Frankfurt am Main',
      city: 'Frankfurt',
      countryCode: 'DE',
    },
    tzone: 'Europe/Berlin',
  },
  {
    code: 'NRT',
    name: 'Narita International Airport',
    address: {
      line: 'Narita, Chiba 282-0004',
      city: 'Narita',
      countryCode: 'JP',
    },
    tzone: 'Asia/Tokyo',
  },
  {
    code: 'JFK',
    name: 'John F. Kennedy International Airport',
    address: {
      line: 'Queens, NY 11430',
      city: 'New York',
      countryCode: 'US',
    },
    tzone: 'America/New_York',
  },
]

export const airportsByCode: Record<string, Airport> = Object.fromEntries(airports.map((a) => [a.code, a]))

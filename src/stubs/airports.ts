import { Airport } from "@/types"

export const airports: Airport[] = [
  {
    code: "BER",
    name: "Berlin Brandenburg Airport",
    address: {
      line: "Willy-Brandt-Platz 1, 12529 Schönefeld",
      city: "Schönefeld",
      country: "Germany"
    },
    tzone: "Europe/Berlin"
  },
  {
    code: "HND",
    name: "Tokyo Haneda Airport",
    address: {
      line: "Haneda Airport, 144-0041 Ota City, Tokyo",
      city: "Tokyo",
      country: "Japan"
    },
    tzone: "Asia/Tokyo"
  },
  {
    code: 'FRA',
    name: 'Frankfurt Airport',
    address: {
      line: '60547 Frankfurt am Main',
      city: 'Frankfurt',
      country: 'Germany',
    },
    tzone: 'Europe/Berlin',
  },
  {
    code: 'NRT',
    name: 'Narita International Airport',
    address: {
      line: 'Narita, Chiba 282-0004',
      city: 'Narita',
      country: 'Japan',
    },
    tzone: 'Asia/Tokyo',
  },
  {
    code: 'JFK',
    name: 'John F. Kennedy International Airport',
    address: {
      line: 'Queens, NY 11430',
      city: 'New York',
      country: 'United States',
    },
    tzone: 'America/New_York',
  },
]

export const airportsByCode: Record<string, Airport> = Object.fromEntries(
  airports.map(a => [a.code, a])
)

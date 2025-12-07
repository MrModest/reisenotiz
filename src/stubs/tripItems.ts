import { Airport, Flight, Hotel, TripItem, UUID } from '@/types'
import { trips } from './trips'

const persons = [
  { id: 'vvc32db4-d180-46a1-bc30-afa9dccc85b3', fullname: 'Max Mustermann', contacts: [] },
  { id: '8325281d-1901-4eda-9c4e-58f58b94893d', fullname: 'Maria Mustermann', contacts: [] },
  { id: 'f12afa65-22c8-4545-8f34-0523d00c789d', fullname: 'Mark Smith', contacts: [] }
]

const airports: Record<string, Airport> = {
  "BER": {
    code: "BER",
    name: "Berlin Brandenburg Airport",
    address: {
      line: "Willy-Brandt-Platz 1, 12529 Schönefeld",
      city: "Schönefeld",
      country: "Germany"
    },
    tzone: "Europe/Berlin"
  },
  "HND": {
    code: "HND",
    name: "Tokyo Haneda Airport",
    address: {
      line: "Haneda Airport, 144-0041 Ota City, Tokyo",
      city: "Tokyo",
      country: "Japan"
    },
    tzone: "Asia/Tokyo"
  },
}

export const tripsItems: TripItem[] = [
  {
    id: 'bbc32db4-d180-41a1-bc30-afa9dccc85b3' as UUID,
    tripId: trips[0].id,
    type: 'Flight',
    flightNumber: 'PC5030',
    carrier: 'Pegasus',
    bookingCode: 'Q4LTAL',
    seat: '12F, 36B',
    passengers: persons,
    departure: {
      airport: airports["BER"],
      terminal: '2',
      gate: 'A24',
      time: { instant: '2025-12-01T18:00:00.000Z', zone: airports["BER"].tzone }
    },
    arrival: {
      airport: airports["HND"],
      terminal: '1',
      time: { instant: '2025-12-02T06:00:00.000Z', zone: airports["HND"].tzone }
    },
    note: 'Empty note',
    attachments: []
  } as Flight,
  {
    id: 'cbc32db4-d180-41a1-bc30-afa9dccc85b3' as UUID,
    tripId: trips[0].id,
    type: 'Flight',
    flightNumber: 'PC5031',
    carrier: 'Pegasus',
    bookingCode: 'Q4LTAL',
    seat: '12F, 36B',
    passengers: persons,
    departure: {
      airport: airports["HND"],
      terminal: '1',
      gate: 'B16',
      time: { instant: '2025-12-10T10:00:00.000Z', zone: airports["HND"].tzone }
    },
    arrival: {
      airport: airports["BER"],
      terminal: '2',
      time: { instant: '2025-12-10T20:00:00.000Z', zone: airports["BER"].tzone }
    },
    note: 'Empty note',
    attachments: []
  },
  {
    id: 'dbc32db4-d180-41a1-bc30-afa9dccc85b3' as UUID,
    tripId: trips[0].id,
    type: 'Hotel',
    name: 'NH Leipzig Messe',
    address: {
      line: 'Dummy-hotel-straße 345, 12345 Leipzig',
      city: 'Leipzig',
      country: 'Germany'
    },
    contact: '+49 177 1234567',
    reservedOn: 'Max Mustermann',
    guests: 3,
    rooms: 1,
    reservation: {
      checkIn: {
        available: { instant: '2025-03-12T15:00:00.000Z', zone: 'Europe/Berlin' },
        planned: { instant: '2025-03-12T18:30:00.000Z', zone: 'Europe/Berlin' }
      },
      checkOut: {
        available: { instant: '2025-03-13T11:00:00.000Z', zone: 'Europe/Berlin' },
        planned: { instant: '2025-03-13T10:00:00.000Z', zone: 'Europe/Berlin' }
      }
    },
    note: 'notify hotel that we come late',
    attachments: [
      { id: '1', name: 'Booking#1234.pdf' },
      { id: '2', name: 'Booking#2345.pdf' },
      { id: '3', name: 'Booking#3456.pdf' },
      { id: '4', name: 'Booking#4567.pdf' }
    ]
  } as Hotel
]



import { Flight, Accommodation, TripItem } from '@/types'
import { trips } from './trips'
import { airportsByCode } from './airports'

const persons = [
  { id: 'vvc32db4-d180-46a1-bc30-afa9dccc85b3', fullname: 'Max Mustermann', contacts: [] },
  { id: '8325281d-1901-4eda-9c4e-58f58b94893d', fullname: 'Maria Mustermann', contacts: [] },
  { id: 'f12afa65-22c8-4545-8f34-0523d00c789d', fullname: 'Mark Smith', contacts: [] }
]

export const tripsItems: TripItem[] = [
  {
    id: 'bbc32db4-d180-41a1-bc30-afa9dccc85b3',
    tripId: trips[0].id,
    type: 'Flight',
    flightNumber: 'PC5030',
    carrier: 'Pegasus',
    bookingCode: 'Q4LTAL',
    seat: '12F, 36B',
    passengers: persons,
    departure: {
      airport: airportsByCode["BER"],
      terminal: '2',
      gate: 'A24',
      time: { instant: '2025-12-01T18:00:00.000Z', zone: airportsByCode["BER"].tzone }
    },
    arrival: {
      airport: airportsByCode["HND"],
      terminal: '1',
      time: { instant: '2025-12-02T06:00:00.000Z', zone: airportsByCode["HND"].tzone }
    },
    note: '',
    attachments: []
  } as Flight,
  {
    id: 'cbc32db4-d180-41a1-bc30-afa9dccc85b3',
    tripId: trips[0].id,
    type: 'Flight',
    flightNumber: 'PC5031',
    carrier: 'Pegasus',
    bookingCode: 'Q4LTAL',
    seat: '12F, 36B',
    passengers: persons,
    departure: {
      airport: airportsByCode["HND"],
      terminal: '1',
      gate: 'B16',
      time: { instant: '2025-12-10T10:00:00.000Z', zone: airportsByCode["HND"].tzone }
    },
    arrival: {
      airport: airportsByCode["BER"],
      terminal: '2',
      time: { instant: '2025-12-10T20:00:00.000Z', zone: airportsByCode["BER"].tzone }
    },
    note: '',
    attachments: []
  },
  {
    id: 'dbc32db4-d180-41a1-bc30-afa9dccc85b3',
    tripId: trips[0].id,
    type: 'Accommodation',
    site: {
      name: 'NH Leipzig Messe',
      kind: 'Hotel',
      address: {
        line: 'Dummy-hotel-straße 345, 12345 Leipzig',
        city: 'Leipzig',
        country: 'Germany'
      },
      tzone: 'Europe/Berlin',
    },
    contact: '+49 177 1234567',
    reservedOn: 'Max Mustermann',
    guests: 3,
    rooms: 1,
    stayInterval: {
      provided: {
        in: { instant: '2025-03-12T15:00:00.000Z', zone: 'Europe/Berlin' },
        out: { instant: '2025-03-13T11:00:00.000Z', zone: 'Europe/Berlin' }
      },
      planned: {
        in: { instant: '2025-03-12T18:30:00.000Z', zone: 'Europe/Berlin' },
        out: { instant: '2025-03-13T10:00:00.000Z', zone: 'Europe/Berlin' }
      }
    },
    note: 'notify hotel that we come late',
    attachments: [
      { id: '1', name: 'Booking#1234.pdf', tripItemId: 'dbc32db4-d180-41a1-bc30-afa9dccc85b3', link: 'https://example.com/booking1234.pdf' },
      { id: '2', name: 'Booking#2345.pdf', tripItemId: 'dbc32db4-d180-41a1-bc30-afa9dccc85b3', link: 'https://example.com/booking2345.pdf' },
      { id: '3', name: 'Booking#3456.pdf', tripItemId: 'dbc32db4-d180-41a1-bc30-afa9dccc85b3', link: 'https://example.com/booking3456.pdf' },
      { id: '4', name: 'Booking#4567.pdf', tripItemId: 'dbc32db4-d180-41a1-bc30-afa9dccc85b3', link: 'https://example.com/booking4567.pdf' }
    ]
  } as Accommodation
]



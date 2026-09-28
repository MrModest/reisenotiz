import { DateTime, TZ } from '@/lib/datetime'
import { generateUUID } from '@/types/common/uuid'
import type { Airport, Flight } from '@/types'

function draftAirport(tzone: string): Airport {
  return { code: '', name: '', address: { country: '', city: '', line: '' }, tzone }
}

export function createFlightDraft(tripId: string): Flight {
  const zone = TZ.local()
  const time = DateTime.now(zone).toZonedInstant()

  return {
    id: generateUUID(),
    tripId,
    type: 'Flight',
    note: '',
    attachments: [],
    flightNumber: '',
    carrier: '',
    bookingCode: '',
    seat: '',
    passengers: [],
    departure: { airport: draftAirport(zone), time, terminal: '', gate: '' },
    arrival: { airport: draftAirport(zone), time, terminal: '', gate: '' },
  }
}

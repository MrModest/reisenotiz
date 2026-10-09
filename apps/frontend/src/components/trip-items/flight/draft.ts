import { DateTime, TZ } from '@/lib/datetime'
import { generateUUID } from '@/types/common/uuid'
import type { Flight } from '@/types'

// Opens at the current time in the device zone; submit re-anchors it to each airport's zone
export function createFlightDraft(tripId: string): Flight {
  const time = DateTime.now(TZ.local()).toZonedInstant()

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
    departure: { placeKey: '', time, terminal: '', gate: '' },
    arrival: { placeKey: '', time, terminal: '', gate: '' },
  }
}

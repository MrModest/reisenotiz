import { DateTime, TZ } from '@/lib/datetime'
import { generateUUID } from '@/types/common/uuid'
import type { Accommodation } from '@/types'

// Opens at the current time in the device zone, check-in equal to check-out, so the traveller sets
// real dates; submit re-anchors them to the site's zone
export function createAccommodationDraft(tripId: string): Accommodation {
  const time = DateTime.now(TZ.local()).toZonedInstant()

  return {
    id: generateUUID(),
    tripId,
    type: 'Accommodation',
    note: '',
    attachments: [],
    placeKey: '',
    guests: [],
    rooms: 1,
    stayInterval: { provided: { in: time, out: time } },
  }
}

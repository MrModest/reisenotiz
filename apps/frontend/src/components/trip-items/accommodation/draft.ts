import { DateTime, TZ } from '@/lib/datetime'
import { generateUUID } from '@/types/common/uuid'
import type { Accommodation } from '@/types'

export function createAccommodationDraft(tripId: string): Accommodation {
  const zone = TZ.local()
  const time = DateTime.now(zone).toZonedInstant()

  return {
    id: generateUUID(),
    tripId,
    type: 'Accommodation',
    note: '',
    attachments: [],
    site: {
      name: '',
      kind: 'Hotel',
      address: { country: '', city: '', line: '' },
      contact: '',
      tzone: zone,
    },
    reservedOn: undefined,
    guests: 1,
    rooms: 1,
    stayInterval: { provided: { in: time, out: time } },
  }
}

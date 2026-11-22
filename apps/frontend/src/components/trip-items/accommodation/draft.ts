import { DateTime, TZ } from '@/lib/datetime'
import { generateUUID } from '@/types/common/uuid'
import { accommodationSiteModule } from '@/components/places/accommodation-site'
import type { Accommodation } from '@/types'

export function createAccommodationDraft(tripId: string): Accommodation {
  const time = DateTime.now(TZ.local()).toZonedInstant()

  return {
    id: generateUUID(),
    tripId,
    type: 'Accommodation',
    note: '',
    attachments: [],
    place: accommodationSiteModule.empty(),
    guests: [],
    rooms: 1,
    stayInterval: { provided: { in: time, out: time } },
  }
}

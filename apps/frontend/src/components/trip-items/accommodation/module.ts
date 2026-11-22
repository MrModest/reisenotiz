import { joinWith } from '@/lib/utils'
import type { Accommodation } from '@/types'
import type { TripItemModule } from '../module'
import { createAccommodationDraft } from './draft'
import { AccommodationForm } from './form'
import { AccommodationView } from './view'

export const accommodationModule: TripItemModule<Accommodation> = {
  type: 'Accommodation',
  label: 'Stay',
  icon: 'accommodation',
  createDraft: createAccommodationDraft,
  toTimelineElements: (stay) => {
    const title = stay.place.name
    const summary = (role: string) => joinWith(' · ', [role, stay.place.address.line])

    return [
      {
        id: `${stay.id}-checkIn`,
        tripItemId: stay.id,
        type: 'Accommodation',
        at: stay.stayInterval.planned?.in ?? stay.stayInterval.provided.in,
        title,
        summary: summary('Check-in'),
      },
      {
        id: `${stay.id}-checkOut`,
        tripItemId: stay.id,
        type: 'Accommodation',
        at: stay.stayInterval.planned?.out ?? stay.stayInterval.provided.out,
        title,
        summary: summary('Check-out'),
      },
    ]
  },
  View: AccommodationView,
  Form: AccommodationForm,
}

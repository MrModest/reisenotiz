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
  toTimelineElements: (stay) => [
    {
      id: `${stay.id}-checkIn`,
      tripItemId: stay.id,
      type: 'Accommodation',
      at: stay.stayInterval.planned?.in ?? stay.stayInterval.provided.in,
      title: stay.site.name,
      summary: `Check-in · ${stay.site.address.line}`,
    },
    {
      id: `${stay.id}-checkOut`,
      tripItemId: stay.id,
      type: 'Accommodation',
      at: stay.stayInterval.planned?.out ?? stay.stayInterval.provided.out,
      title: stay.site.name,
      summary: `Check-out · ${stay.site.address.line}`,
    },
  ],
  View: AccommodationView,
  Form: AccommodationForm,
}

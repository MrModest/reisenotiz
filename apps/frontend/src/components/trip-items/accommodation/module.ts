import { findSavedPlace } from '@/store'
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
  toTimelineElements: (stay, places) => {
    const site = findSavedPlace(places, 'AccommodationSite', stay.placeKey)
    const title = site?.name ?? 'Unknown place'
    const summary = (role: string) => [role, site?.address.line].filter(Boolean).join(' · ')

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

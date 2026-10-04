import { DateTime } from '@/lib/datetime'
import { routes } from '@/lib/routes'
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
      id: `${stay.id}-checkin`,
      title: `Check-In: ${stay.site.name}`,
      description: `${stay.site.address.line}`,
      datetime: stay.stayInterval.planned?.in || stay.stayInterval.provided.in,
      link: routes.trips.item(stay.tripId, stay.id),
      icon: 'hotel-checkIn',
      status: DateTime.from(stay.stayInterval.provided.in).isPast() ? 'inactive' : 'active',
    },
    {
      id: `${stay.id}-checkout`,
      title: `Check-Out: ${stay.site.name}`,
      description: `${stay.site.address.line}`,
      datetime: stay.stayInterval.planned?.out || stay.stayInterval.provided.out,
      link: routes.trips.item(stay.tripId, stay.id),
      icon: 'hotel-checkOut',
      status: DateTime.from(stay.stayInterval.provided.out).isPast() ? 'inactive' : 'active',
    },
  ],
  View: AccommodationView,
  Form: AccommodationForm,
}

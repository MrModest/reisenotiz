import { DateTime, ZonedInstant } from '@/lib/datetime'
import { TripItem } from './trip-item'
import { TimelineElement } from '@/components/ui/timeline'
import { Address } from './address'
import { routes } from '@/lib/routes'

export interface StayInterval {
  in: ZonedInstant
  out: ZonedInstant
}

export const ACCOMMODATION_SITE_KINDS = [
  'Hotel',
  'Hostel',
  'Apartment',
  'Guesthouse',
  'BnB',
  'Resort',
  'Other',
] as const

export type AccommodationSiteKind = (typeof ACCOMMODATION_SITE_KINDS)[number]

export interface AccommodationSite {
  id?: string
  name: string
  kind: AccommodationSiteKind
  address: Address
  contact?: string
  tzone: string
}

export interface Accommodation extends TripItem {
  type: 'Accommodation'
  site: AccommodationSite
  reservedOn?: string // TODO: migrate to `Person`
  guests: number // TODO: migrate to `Person[]`
  rooms: number
  stayInterval: {
    provided: StayInterval
    planned?: StayInterval
  }
}

function isPast(datetime: ZonedInstant): boolean {
  return DateTime.from(datetime).isPast()
}

export function getHotelTimelineItems(hotel: Accommodation): TimelineElement[] {
  return [
    {
      id: `${hotel.id}-checkin`,
      title: `Check-In: ${hotel.site.name}`,
      description: `${hotel.site.address.line}`,
      datetime: hotel.stayInterval.planned?.in || hotel.stayInterval.provided.in,
      link: routes.trips.item(hotel.tripId, hotel.id),
      icon: 'hotel-checkIn',
      status: isPast(hotel.stayInterval.provided.in) ? 'inactive' : 'active',
    },
    {
      id: `${hotel.id}-checkout`,
      title: `Check-Out: ${hotel.site.name}`,
      description: `${hotel.site.address.line}`,
      datetime: hotel.stayInterval.planned?.out || hotel.stayInterval.provided.out,
      link: routes.trips.item(hotel.tripId, hotel.id),
      icon: 'hotel-checkOut',
      status: isPast(hotel.stayInterval.provided.out) ? 'inactive' : 'active',
    },
  ]
}
